
'use server';

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

interface UserJwtPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  iat: number;
  exp: number;
}

export async function generateToken(payload: { userId: string, email: string, firstName: string, lastName: string }): Promise<string> {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err || !token) {
          return reject(err);
        }
        resolve(token);
      }
    );
  });
}

export async function verifyToken(token: string): Promise<UserJwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err || !decoded) {
        return reject(err);
      }
      resolve(decoded as UserJwtPayload);
    });
  });
}
