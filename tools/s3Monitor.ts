import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import S3 from '../server/utils/s3.js';
import fileProcessor from '../server/utils/fileProcessor.js';
import shell from 'shelljs';
import fs from 'fs';

const prisma = new PrismaClient();
const s3Instance = S3.getInstance({
  region: useRuntimeConfig().s3.region || '',
  endpoint: useRuntimeConfig().s3.endpoint || '',
  accessKeyId: useRuntimeConfig().s3.accessKey || '',
  secretAccessKey: useRuntimeConfig().s3.secretKey || '',
});
let firstRun = true;

async function waitForReset() {
  // wait for 60 seconds
  console.log('Waiting for 10 seconds');
  console.log('---------------------------------');
  await new Promise((resolve) => setTimeout(resolve, 10 * 1000));
}

async function main() {
  console.log('Starting to monitor s3 bucket for changes');

  const targetDir = process.env.WORKING_TMP_FOLDER || './.tmp';
  if (fs.existsSync(targetDir)) fs.rmSync(targetDir, { recursive: true });
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

  while (true) {
    // get current date
    const checkDate = firstRun ? dayjs('1900-01-01') : dayjs().subtract(1, 'day').startOf('day');

    // get all files from s3
    const allFiles = await s3Instance.getAllFiles();

    console.log(`Found ${allFiles.length} files`);

    // filter files that are newer than last updated time
    const cleanedFiles = allFiles.filter((file) =>
      dayjs(file.lastModified).startOf('second').isAfter(dayjs(checkDate)),
    );

    console.log(`Found ${cleanedFiles.length} new files`);

    // format them as needed
    let count = 0;
    for (let i = 0; i < cleanedFiles.length; i++) {
      const file = allFiles[i];

      // check if already processed
      const existingFile = await prisma.item.findFirst({
        where: { path: file.fullPath },
      });
      if (existingFile) continue;

      console.log(`Processing file ${file.key}`);

      // check if file is accessible
      const { stdout: canAccessFile } = shell.exec(`curl -I ${file.fullPath}`, { silent: true });
      if (/HTTP(?:\/\d(?:\.\d)?)? 403/.test(canAccessFile)) {
        // update privacy of file
        await s3Instance.updateFilePermissions(file.key);
      }

      // check content type
      // if video
      if (file.contentType.startsWith('video/')) {
        // get metadata
        const videoName = file.key.split('/').pop() || '';
        const videoMetadata = await fileProcessor.video.getMetadata({ videoPath: file.fullPath });
        const newVideoThumbnail = await fileProcessor.video.getThumbnailAt({
          videoName: videoName,
          videoPath: file.fullPath,
          duration: videoMetadata.duration,
          timePercentage: 10,
        });

        // upload to s3
        await s3Instance.upload({
          targetPath: file.key.replace(videoName, newVideoThumbnail.name),
          localPath: newVideoThumbnail.path,
        });

        // insert item into db
        await prisma.item.create({
          data: {
            // item data
            description: '',
            people: '',
            dateEstimate: true,
            takenAt: dayjs().toISOString().split('T')[0],
            type: 'video',
            // file data
            name: videoName,
            path: file.fullPath,
            size: file.size.toString(),
            metadata: videoMetadata,
            // privacy
            published: 'private',
            // owner
            owner: { connect: { email: 'j.larminay@gmail.com' } },
          },
        });

        // cleanup
        fileProcessor.delete(videoName);
        count++;
      }
      // if image
      else if (file.contentType.startsWith('image/')) {
        // get metadata
        const imageName = file.key.split('/').pop() || '';
        const imageMetadata = await fileProcessor.image.getMetadata({
          name: imageName,
          path: file.fullPath,
        });
        const newImageThumbnail = await fileProcessor.image.getThumbnail({
          name: imageName,
          path: file.fullPath,
        });

        // upload to s3
        await s3Instance.upload({
          targetPath: file.key.replace(imageName, newImageThumbnail.name),
          localPath: newImageThumbnail.path,
        });

        // insert item into db
        await prisma.item.create({
          data: {
            // item data
            description: '',
            people: '',
            dateEstimate: true,
            takenAt: dayjs().toISOString().split('T')[0],
            type: 'image',
            // file data
            name: imageName,
            path: file.fullPath,
            size: file.size.toString(),
            metadata: imageMetadata,
            // privacy
            published: 'private',
            // owner
            owner: { connect: { email: 'j.larminay@gmail.com' } },
          },
        });

        // cleanup
        fileProcessor.delete(imageName);

        // cleanup
        count++;
      }

      // add delay of 0.5s
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // console log if needed
    if (count > 0) console.log(`Inserted ${count} files`);

    // set first run to false
    firstRun = false;

    // wait given time
    await waitForReset();
  }
}

main();
