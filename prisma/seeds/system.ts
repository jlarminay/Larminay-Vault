import { PrismaClient } from '@prisma/client';
import S3 from '../../server/utils/s3.js';
import { resolve } from 'path';
import { createReadStream } from 'fs';

const prisma = new PrismaClient();
const s3 = new S3();

export default async () => {
  // define seeds
  const newData = [
    {
      name: 'familyTree',
      value:
        '[{"firstPerson":{"id":1},"secondPerson":{"id":2},"children":[{"firstPerson":{"id":3},"secondPerson":{"id":4},"children":[{"firstPerson":{"id":5},"secondPerson":{"id":6},"children":[{"firstPerson":{"name":"John","birthday":"1990-01-01","deathday":"2021-01-01","videos":null,"gender":null,"image":{"path":"https://via.placeholder.com/150"}},"secondPerson":{"id":2}},{"firstPerson":{"id":3}}]},{"firstPerson":{"id":4},"secondPerson":{"id":5}}]},{"firstPerson":{"id":6},"secondPerson":{"id":1}},{"firstPerson":{"id":2},"secondPerson":{"id":3},"children":[{"firstPerson":{"id":4}},{"firstPerson":{"id":5}},{"firstPerson":{"id":6}}]}]}]',
    },
  ];

  // create seeds
  for (let i = 0; i < newData.length; i++) {
    // insert into db
    await prisma.system.create({
      data: newData[i],
    });
  }
  console.log('Insert system: ', newData.length);
};
