import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ObjectId } from 'mongodb';
import {
  clearSessionCookie,
  createSessionToken,
  createUser,
  findUserByEmail,
  getUserFromRequest,
  requireUser,
  setSessionCookie,
  userOwnsBook,
  verifyPassword,
  type AuthUser,
} from './auth';
import { getDb, serialize, serializeMany, toObjectId } from './db';

type Variables = {
  user: AuthUser;
};

const app = new Hono<{ Variables: Variables }>().basePath('/api');

app.use('*', cors({
  origin: (origin) => origin || '*',
  credentials: true,
}));

app.get('/health', (c) => c.json({ ok: true, store: 'mongodb' }));

// ── Auth ─────────────────────────────────────────────────────────────

app.post('/auth/signup', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password || '';

  if (!email || !password) return c.json({ error: 'Email and password required' }, 400);
  if (password.length < 6) return c.json({ error: 'Password must be at least 6 characters' }, 400);

  const existing = await findUserByEmail(email);
  if (existing) return c.json({ error: 'An account with this email already exists' }, 409);

  const user = await createUser(email, password);
  const token = await createSessionToken(user);
  setSessionCookie(c, token);
  return c.json({ user });
});

app.post('/auth/signin', async (c) => {
  const body = await c.req.json<{ email?: string; password?: string }>();
  const email = body.email?.trim().toLowerCase();
  const password = body.password || '';

  if (!email || !password) return c.json({ error: 'Email and password required' }, 400);

  const doc = await findUserByEmail(email);
  if (!doc || typeof doc.passwordHash !== 'string') {
    return c.json({ error: 'Invalid email or password' }, 401);
  }

  const ok = await verifyPassword(password, doc.passwordHash);
  if (!ok) return c.json({ error: 'Invalid email or password' }, 401);

  const user = { id: (doc._id as ObjectId).toString(), email: doc.email as string };
  const token = await createSessionToken(user);
  setSessionCookie(c, token);
  return c.json({ user });
});

app.post('/auth/signout', async (c) => {
  clearSessionCookie(c);
  return c.json({ ok: true });
});

app.get('/auth/me', async (c) => {
  const user = await getUserFromRequest(c);
  if (!user) return c.json({ user: null });
  return c.json({ user });
});

async function withAuth(c: Parameters<typeof requireUser>[0]) {
  const result = await requireUser(c);
  if (result instanceof Response) return null;
  return result;
}

// ── Books ────────────────────────────────────────────────────────────

app.get('/books', async (c) => {
  const user = await withAuth(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const db = await getDb();
  const books = await db
    .collection('books')
    .find({ user_id: user.id })
    .sort({ updated_at: -1 })
    .toArray();
  return c.json({ data: serializeMany(books as Record<string, unknown>[]) });
});

app.post('/books', async (c) => {
  const user = await withAuth(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json<Record<string, unknown>>();
  const now = new Date();
  const doc = {
    user_id: user.id,
    title: (body.title as string) || 'Untitled',
    author: (body.author as string) || '',
    genre: (body.genre as string) || '',
    cover_url: (body.cover_url as string) || '',
    progress: 0,
    phase: 'Concept',
    status: 'draft',
    word_count: 0,
    target_word_count: Number(body.target_word_count) || 80000,
    deadline: (body.deadline as string) || null,
    created_at: now,
    updated_at: now,
  };

  const db = await getDb();
  const result = await db.collection('books').insertOne(doc);
  return c.json({ data: serialize({ _id: result.insertedId, ...doc }) }, 201);
});

app.patch('/books/:id', async (c) => {
  const user = await withAuth(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = toObjectId(c.req.param('id'));
  if (!id) return c.json({ error: 'Invalid id' }, 400);

  const body = await c.req.json<Record<string, unknown>>();
  const allowed = [
    'title', 'author', 'genre', 'cover_url', 'progress', 'phase',
    'status', 'word_count', 'target_word_count', 'deadline',
  ];
  const update: Record<string, unknown> = { updated_at: new Date() };
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  const db = await getDb();
  const result = await db.collection('books').findOneAndUpdate(
    { _id: id, user_id: user.id },
    { $set: update },
    { returnDocument: 'after' },
  );
  if (!result) return c.json({ error: 'Not found' }, 404);
  return c.json({ data: serialize(result as Record<string, unknown>) });
});

app.delete('/books/:id', async (c) => {
  const user = await withAuth(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const id = toObjectId(c.req.param('id'));
  if (!id) return c.json({ error: 'Invalid id' }, 400);

  const db = await getDb();
  const book = await db.collection('books').findOne({ _id: id, user_id: user.id });
  if (!book) return c.json({ error: 'Not found' }, 404);

  const bookId = id.toString();
  await Promise.all([
    db.collection('books').deleteOne({ _id: id }),
    db.collection('characters').deleteMany({ book_id: bookId }),
    db.collection('chapters').deleteMany({ book_id: bookId }),
    db.collection('editorial_tasks').deleteMany({ book_id: bookId }),
    db.collection('production_tasks').deleteMany({ book_id: bookId }),
    db.collection('marketing_items').deleteMany({ book_id: bookId }),
    db.collection('activity_log').updateMany({ book_id: bookId }, { $set: { book_id: null } }),
  ]);

  return c.json({ ok: true });
});

// ── Nested book resources helper ─────────────────────────────────────

async function requireBookAccess(c: Parameters<typeof withAuth>[0], bookId: string) {
  const user = await withAuth(c);
  if (!user) return { error: c.json({ error: 'Unauthorized' }, 401) as Response };
  const owns = await userOwnsBook(user.id, bookId);
  if (!owns) return { error: c.json({ error: 'Not found' }, 404) as Response };
  return { user };
}

function collectionCrud(collection: string, defaults: (bookId: string, body: Record<string, unknown>) => Record<string, unknown>) {
  app.get(`/${collection}`, async (c) => {
    const bookId = c.req.query('book_id');
    if (!bookId) return c.json({ error: 'book_id required' }, 400);
    const access = await requireBookAccess(c, bookId);
    if ('error' in access && access.error) return access.error;

    const db = await getDb();
    const sortField = collection === 'chapters' ? 'number' : 'created_at';
    const docs = await db
      .collection(collection)
      .find({ book_id: bookId })
      .sort({ [sortField]: 1 })
      .toArray();
    return c.json({ data: serializeMany(docs as Record<string, unknown>[]) });
  });

  app.post(`/${collection}`, async (c) => {
    const body = await c.req.json<Record<string, unknown>>();
    const bookId = (body.book_id as string) || '';
    if (!bookId) return c.json({ error: 'book_id required' }, 400);
    const access = await requireBookAccess(c, bookId);
    if ('error' in access && access.error) return access.error;

    const doc = { ...defaults(bookId, body), created_at: new Date() };
    const db = await getDb();
    const result = await db.collection(collection).insertOne(doc);
    return c.json({ data: serialize({ _id: result.insertedId, ...doc }) }, 201);
  });

  app.patch(`/${collection}/:id`, async (c) => {
    const id = toObjectId(c.req.param('id'));
    if (!id) return c.json({ error: 'Invalid id' }, 400);

    const db = await getDb();
    const existing = await db.collection(collection).findOne({ _id: id });
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const access = await requireBookAccess(c, existing.book_id as string);
    if ('error' in access && access.error) return access.error;

    const body = await c.req.json<Record<string, unknown>>();
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (['id', '_id', 'book_id', 'created_at', 'user_id'].includes(key)) continue;
      patch[key] = value;
    }
    const result = await db.collection(collection).findOneAndUpdate(
      { _id: id },
      { $set: patch },
      { returnDocument: 'after' },
    );
    return c.json({ data: serialize(result as Record<string, unknown>) });
  });

  app.delete(`/${collection}/:id`, async (c) => {
    const id = toObjectId(c.req.param('id'));
    if (!id) return c.json({ error: 'Invalid id' }, 400);

    const db = await getDb();
    const existing = await db.collection(collection).findOne({ _id: id });
    if (!existing) return c.json({ error: 'Not found' }, 404);

    const access = await requireBookAccess(c, existing.book_id as string);
    if ('error' in access && access.error) return access.error;

    await db.collection(collection).deleteOne({ _id: id });
    return c.json({ ok: true });
  });
}

collectionCrud('characters', (bookId, body) => ({
  book_id: bookId,
  name: (body.name as string) || 'New Character',
  role: (body.role as string) || '',
  archetype: (body.archetype as string) || '',
  arc: (body.arc as string) || '',
  connections: Number(body.connections) || 0,
  image_url: (body.image_url as string) || '',
  notes: (body.notes as string) || '',
}));

collectionCrud('chapters', (bookId, body) => ({
  book_id: bookId,
  number: Number(body.number) || 1,
  title: (body.title as string) || 'Untitled Chapter',
  status: (body.status as string) || 'draft',
  word_count: Number(body.word_count) || 0,
  target_word_count: Number(body.target_word_count) || 4000,
  pov: (body.pov as string) || '',
  notes: (body.notes as string) || '',
}));

collectionCrud('editorial_tasks', (bookId, body) => ({
  book_id: bookId,
  title: (body.title as string) || 'New Task',
  chapter: (body.chapter as string) || '',
  assignee: (body.assignee as string) || '',
  severity: (body.severity as string) || 'medium',
  status: (body.status as string) || 'backlog',
  type: (body.type as string) || '',
}));

collectionCrud('production_tasks', (bookId, body) => ({
  book_id: bookId,
  task: (body.task as string) || 'New Task',
  status: (body.status as string) || 'planned',
  due: (body.due as string) || null,
  assignee: (body.assignee as string) || '',
  category: (body.category as string) || '',
}));

collectionCrud('marketing_items', (bookId, body) => ({
  book_id: bookId,
  title: (body.title as string) || 'New Campaign',
  channel: (body.channel as string) || '',
  status: (body.status as string) || 'planned',
  reach: (body.reach as string) || '',
  date: (body.date as string) || null,
}));

// ── Activity ─────────────────────────────────────────────────────────

app.get('/activity', async (c) => {
  const user = await withAuth(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const db = await getDb();
  const docs = await db
    .collection('activity_log')
    .find({ user_id: user.id })
    .sort({ created_at: -1 })
    .limit(50)
    .toArray();
  return c.json({ data: serializeMany(docs as Record<string, unknown>[]) });
});

app.post('/activity', async (c) => {
  const user = await withAuth(c);
  if (!user) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json<Record<string, unknown>>();
  const doc = {
    user_id: user.id,
    book_id: (body.book_id as string) || null,
    action: (body.action as string) || '',
    target: (body.target as string) || '',
    entity_type: (body.entity_type as string) || '',
    entity_id: (body.entity_id as string) || null,
    created_at: new Date(),
  };

  const db = await getDb();
  const result = await db.collection('activity_log').insertOne(doc);
  return c.json({ data: serialize({ _id: result.insertedId, ...doc }) }, 201);
});

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || 'Internal server error' }, 500);
});

export default app;
