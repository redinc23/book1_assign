import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import type { Context } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { getDb } from './db';
import { ObjectId } from 'mongodb';

const COOKIE_NAME = 'mangu_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type AuthUser = {
  id: string;
  email: string;
};

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('Missing AUTH_SECRET environment variable');
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: AuthUser) {
  return new SignJWT({ email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function readSessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== 'string') return null;
    return { id: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

export function setSessionCookie(c: Context, token: string) {
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export function clearSessionCookie(c: Context) {
  deleteCookie(c, COOKIE_NAME, { path: '/' });
}

export async function getUserFromRequest(c: Context): Promise<AuthUser | null> {
  const cookie = getCookie(c, COOKIE_NAME);
  if (!cookie) return null;
  return readSessionToken(cookie);
}

export async function requireUser(c: Context): Promise<AuthUser | Response> {
  const user = await getUserFromRequest(c);
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  return user;
}

export async function findUserByEmail(email: string) {
  const db = await getDb();
  return db.collection('users').findOne({ email: email.toLowerCase() });
}

export async function createUser(email: string, password: string) {
  const db = await getDb();
  const passwordHash = await hashPassword(password);
  const now = new Date();
  const result = await db.collection('users').insertOne({
    email: email.toLowerCase(),
    passwordHash,
    created_at: now,
  });
  return { id: result.insertedId.toString(), email: email.toLowerCase() };
}

export async function userOwnsBook(userId: string, bookId: string) {
  const db = await getDb();
  if (!ObjectId.isValid(bookId)) return false;
  const book = await db.collection('books').findOne({
    _id: new ObjectId(bookId),
    user_id: userId,
  });
  return Boolean(book);
}
