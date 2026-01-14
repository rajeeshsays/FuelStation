
'use server';

import connectToDatabase from '@/lib/db';
import AuditLogModel from '@/models/AuditLog';
import type { AuditLogMethod } from './types';

/**
 * Creates an audit log entry.
 * @param method - The type of operation (INSERT, UPDATE, DELETE).
 * @param description - A brief description of the action performed.
 */
export async function logAction(method: AuditLogMethod, description: string) {
    try {
        await connectToDatabase();
        await AuditLogModel.create({ method, description });
    } catch (error) {
        // In a real app, you might want more robust error handling here,
        // like logging to a dedicated monitoring service.
        console.error('Failed to create audit log:', error);
    }
}
