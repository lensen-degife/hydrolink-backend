import {
  PrismaClient,
  BillStatus,
  PaymentMethod,
  PaymentStatus,
  RequestType,
  RequestStatus,
  Urgency,
  SupplyStatus,
  NotificationType,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HydroLink database...");

  // Clean existing data (order matters due to FKs)
  await prisma.notification.deleteMany();
  await prisma.deviceToken.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.usageRecord.deleteMany();
  await prisma.serviceRequest.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.otp.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const usersData = [
    {
      fullName: "Abebe Bikila",
      email: "abebe.bikila@example.com",
      phone: "+251911223344",
      accountNumber: "AAWSA-000123",
      kebele: "Kebele 01",
    },
    {
      fullName: "Tigist Alemu",
      email: "tigist.alemu@example.com",
      phone: "+251922334455",
      accountNumber: "AAWSA-000456",
      kebele: "Kebele 03",
    },
    {
      fullName: "Dawit Getachew",
      email: "dawit.getachew@example.com",
      phone: "+251933445566",
      accountNumber: "AAWSA-000789",
      kebele: "Kebele 07",
    },
  ];

  const users = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: { ...u, passwordHash, isVerified: true },
    });
    users.push(user);
  }
  console.log(`✅ Created ${users.length} users`);

  // ---- Schedules ----
  const kebeles = ["Kebele 01", "Kebele 03", "Kebele 07"];
  const scheduleSlots: { dayOfWeek: number; startTime: string; endTime: string; status: SupplyStatus }[] = [
    { dayOfWeek: 1, startTime: "06:00", endTime: "10:00", status: SupplyStatus.AVAILABLE },
    { dayOfWeek: 3, startTime: "06:00", endTime: "10:00", status: SupplyStatus.AVAILABLE },
    { dayOfWeek: 5, startTime: "14:00", endTime: "18:00", status: SupplyStatus.AVAILABLE },
    { dayOfWeek: 0, startTime: "00:00", endTime: "23:59", status: SupplyStatus.SCHEDULED_OFF },
  ];

  for (const kebele of kebeles) {
    for (const slot of scheduleSlots) {
      await prisma.schedule.create({
        data: { kebele, ...slot, note: "Standard rotation schedule" },
      });
    }
  }
  console.log(`✅ Created schedules for ${kebeles.length} kebeles`);

  // ---- Bills, Payments, Usage ----
  const now = new Date();
  for (const user of users) {
    for (let i = 0; i < 4; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const periodMonth = date.getMonth() + 1;
      const periodYear = date.getFullYear();
      const usageM3 = Math.round((8 + Math.random() * 12) * 10) / 10;
      const amountEtb = Math.round(usageM3 * 25 * 100) / 100; // ~25 ETB/m3

      await prisma.usageRecord.create({
        data: { userId: user.id, periodMonth, periodYear, usageM3 },
      });

      const dueDate = new Date(periodYear, periodMonth, 10); // 10th of following month
      const isLatest = i === 0;

      const bill = await prisma.bill.create({
        data: {
          userId: user.id,
          periodMonth,
          periodYear,
          usageM3,
          amountEtb,
          dueDate,
          status: isLatest ? BillStatus.UNPAID : BillStatus.PAID,
        },
      });

      if (!isLatest) {
        await prisma.payment.create({
          data: {
            userId: user.id,
            billId: bill.id,
            amountEtb,
            method: PaymentMethod.TELEBIRR,
            status: PaymentStatus.SUCCESS,
            transactionRef: `TXN-SEED-${user.id.slice(0, 6)}-${periodMonth}${periodYear}`,
            paidAt: new Date(periodYear, periodMonth - 1, 15),
          },
        });
      }
    }
  }
  console.log("✅ Created bills, payments, and usage history");

  // ---- Service Requests ----
  await prisma.serviceRequest.create({
    data: {
      userId: users[0].id,
      type: RequestType.LEAK,
      description: "Visible leak near the main pipe outside the compound gate.",
      location: "Kebele 01, near the school",
      urgency: Urgency.HIGH,
      status: RequestStatus.OPEN,
    },
  });
  await prisma.serviceRequest.create({
    data: {
      userId: users[1].id,
      type: RequestType.NO_SUPPLY,
      description: "No water supply for the last 3 scheduled days.",
      urgency: Urgency.CRITICAL,
      status: RequestStatus.IN_PROGRESS,
    },
  });
  await prisma.serviceRequest.create({
    data: {
      userId: users[2].id,
      type: RequestType.METER_ISSUE,
      description: "Meter reading appears stuck, hasn't changed in two months.",
      urgency: Urgency.MEDIUM,
      status: RequestStatus.RESOLVED,
    },
  });
  console.log("✅ Created service requests");

  // ---- Announcements ----
  await prisma.announcement.create({
    data: {
      title: "Scheduled Maintenance - Kebele 01 & 03",
      body: "Water supply will be temporarily suspended on Saturday from 8:00 AM to 2:00 PM for pipeline maintenance.",
      kebele: null,
    },
  });
  await prisma.announcement.create({
    data: {
      title: "New Tariff Rates Effective Next Month",
      body: "AAWSA has announced updated water tariff rates effective from next billing cycle. Please check your account for details.",
      kebele: null,
    },
  });
  await prisma.announcement.create({
    data: {
      title: "Pipe Replacement in Kebele 07",
      body: "Ongoing pipe replacement work may cause low pressure in parts of Kebele 07 this week.",
      kebele: "Kebele 07",
    },
  });
  console.log("✅ Created announcements");

  // ---- Notifications ----
  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.BILL,
        title: "New bill available",
        body: "Your latest water bill is ready to view.",
      },
    });
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: NotificationType.ANNOUNCEMENT,
        title: "Scheduled Maintenance Notice",
        body: "Please check the announcements tab for upcoming maintenance in your area.",
      },
    });
  }
  console.log("✅ Created notifications");

  console.log("🎉 Seeding complete!");
  console.log("   Sample login: abebe.bikila@example.com / Password123!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
