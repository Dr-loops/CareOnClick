const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("DEBUG: Connecting...");
    try {
        await prisma.$connect();
        console.log("DEBUG: Connected.");

        console.log("DEBUG: Deleting Appointments...");
        try {
            const res = await prisma.appointment.deleteMany({});
            console.log("DEBUG: Deleted Appointments:", res.count);
        } catch (e) {
            console.error("ERROR Deleting Appointments:", e.code, e.meta, e.message.substring(0, 100));
        }

        console.log("DEBUG: Deleting Vitals...");
        try {
            const res = await prisma.vitalSign.deleteMany({});
            console.log("DEBUG: Deleted Vitals:", res.count);
        } catch (e) {
            console.error("ERROR Deleting Vitals:", e.code, e.meta, e.message.substring(0, 100));
        }

        console.log("DEBUG: Deleting Tasks...");
        try {
            const res = await prisma.task.deleteMany({});
            console.log("DEBUG: Deleted Tasks:", res.count);
        } catch (e) {
            console.error("ERROR Deleting Tasks:", e.code, e.meta, e.message.substring(0, 100));
        }

        console.log("DEBUG: Deleting Messages...");
        try {
            const res = await prisma.message.deleteMany({});
            console.log("DEBUG: Deleted Messages:", res.count);
        } catch (e) {
            console.error("ERROR Deleting Messages:", e.code, e.meta, e.message.substring(0, 100));
        }

        console.log("DEBUG: Deleting Patient Profiles...");
        try {
            const res = await prisma.patientProfile.deleteMany({});
            console.log("DEBUG: Deleted Patient Profiles:", res.count);
        } catch (e) {
            console.error("ERROR Deleting Patient Profiles:", e.code, e.meta, e.message.substring(0, 100));
        }

        console.log("DEBUG: Deleting Patients...");
        try {
            const res = await prisma.user.deleteMany({ where: { role: 'patient' } });
            console.log("DEBUG: Deleted Patients:", res.count);
        } catch (e) {
            console.error("ERROR Deleting Patients:", e.code, e.meta, e.message.substring(0, 100));
        }

    } catch (e) {
        console.error("FATAL:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
