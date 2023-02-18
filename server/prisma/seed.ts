import { PrismaClient } from '@prisma/client';

import seed from './seed.json';

const prisma = new PrismaClient();

(async () => {
  try {
    await prisma.$transaction(
      seed.sessions.map((session) => prisma.session.create({ data: session })),
    );

    await prisma.$transaction(seed.users.map((user) => prisma.user.create({ data: user })));

    await prisma.$transaction(
      seed.activities.map((activity) => prisma.activity.create({ data: activity })),
    );
  } catch (err) {
    console.error(err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
})();
