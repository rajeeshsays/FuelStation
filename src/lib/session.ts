'use server';

import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

export async function getSession() {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await verifyToken(sessionCookie);
    return decoded;
  } catch (error) {
    return null;
  }
}
