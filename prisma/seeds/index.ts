import { PrismaClient } from '@prisma/client';
import setting from './setting.js';
import user from './user.js';
import file from './file.js';
import video from './video.js';
import like from './like.js';
import comment from './comment.js';
import report from './report.js';

const prisma = new PrismaClient();

async function main() {
  await setting();
  await user();
  await file();
  await video();
  await like();
  await comment();
  await report();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
