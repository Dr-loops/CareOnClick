import prisma from './prisma';

/**
 * Logs an action to the AuditLog table.
 * @param {Object} params
 * @param {string} params.action - The action performed (e.g., 'LOGIN', 'BOOK_APPOINTMENT')
 * @param {string} params.actorId - ID of the user performing the action
 * @param {string} params.actorName - Name/Email of the user performing the action
 * @param {string} [params.target] - The target of the action (e.g., 'Patient:123')
 * @param {string} [params.details] - Additional details about the action
 */
export async function logAction({ action, actorId, actorName, target, details }) {
    try {
        await prisma.auditLog.create({
            data: {
                action: action.toUpperCase(),
                actorId,
                actorName,
                target,
                details,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error('Failed to log action:', error);
    }
}
