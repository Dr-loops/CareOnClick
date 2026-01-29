const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const appointments = await prisma.appointment.findMany();
    const methods = ['MOMO', 'VISA', 'MASTERCARD', 'PAYPAL', 'BANK TRANSFER'];

    for (const app of appointments) {
        let updateData = {};

        // Random Cost between 150 and 500
        const totalCost = Math.floor(Math.random() * (500 - 150 + 1)) + 150;

        if (app.status === 'Completed' || app.paymentStatus === 'Paid') {
            updateData.amountPaid = totalCost;
            updateData.balanceDue = 0;
            updateData.paymentStatus = 'Paid';
            updateData.paymentMethod = methods[Math.floor(Math.random() * methods.length)];
        } else {
            // Pending/Upcoming
            updateData.amountPaid = 0;
            updateData.balanceDue = totalCost;
            updateData.paymentStatus = 'Pending';
        }

        // Apply Update
        await prisma.appointment.update({
            where: { id: app.id },
            data: updateData
        });
    }
    console.log(`Backfilled ${appointments.length} appointments.`);
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
