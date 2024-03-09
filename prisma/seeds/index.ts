import { PrismaClient } from '@prisma/client';

import system from './system.js';
import user from './user.js';
import person from './person.js';
import file from './file.js';
import video from './video.js';
import collection from './collection.js';
import like from './like.js';
import comment from './comment.js';
import report from './report.js';

const prisma = new PrismaClient();

async function main() {
  await system();
  await user();
  await file();
  await person();
  await video();
  await collection();
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
