import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { statSync } from 'fs';
import { resolve } from 'path';
import sizeOf from 'image-size';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

export default class VideoProcessor {
  private videoPath: string;

  constructor(video: string) {
    this.videoPath = video;
  }

  getThumbnailAt(opts: { time: string; filename: string }): Promise<void> {
    const { time, filename } = opts;

    return new Promise((resolve, reject) => {
      ffmpeg(this.videoPath)
        .screenshot({
          timestamps: [time],
          filename: filename,
          folder: './.tmp',
        })
        .on('end', () => {
          resolve();
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  async getMetadata(): Promise<{
    duration: number;
    width: number;
    height: number;
    resolution: string;
    size: number;
  }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(this.videoPath, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            duration: parseInt(metadata.streams[0]?.duration || '0'),
            width: metadata.streams[0]?.width || 0,
            height: metadata.streams[0]?.height || 0,
            resolution: `${metadata.streams[0]?.width}x${metadata.streams[0]?.height}`,
            size: metadata.format.size || 0,
          });
        }
      });
    });
  }

  async prepareNewVideo(): Promise<any> {
    let finalData = {
      randomString: Math.random().toString(16).slice(2),
      video: {} as any,
      thumbnail: {} as any,
    };

    // // // manage video
    {
      finalData.video.name = this.videoPath.split('/').pop();
      // get metadata
      const { duration, resolution, size } = await this.getMetadata();
      finalData.video = {
        name: finalData.video.name,
        type: 'video',
        path: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/videos/${finalData.randomString}_${finalData.video.name}`,
        size: size,
        metadata: {
          resolution: resolution,
          duration: duration,
        },
      };
    }

    // // // manage thumbnail
    {
      finalData.thumbnail.name = finalData.video.name.replace('.mp4', '.webp');
      // generate

      await this.getThumbnailAt({
        time: this.getTimestampPercent(finalData.video.metadata.duration, 0.1),
        filename: finalData.thumbnail.name,
      });
      // get metadata
      const dimensions = sizeOf(resolve('./.tmp/' + finalData.thumbnail.name));
      finalData.thumbnail = {
        name: finalData.thumbnail.name,
        type: 'image',
        path: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/videos/${finalData.randomString}_${finalData.thumbnail.name}`,
        size: statSync(resolve('./.tmp/' + finalData.thumbnail.name)).size,
        metadata: {
          resolution: `${dimensions.width}x${dimensions.height}`,
        },
      };
    }

    return finalData;
  }

  private getTimestampPercent(duration: number, percentage: number): string {
    const lengthPercent = Math.floor(duration * percentage);
    const hours = Math.floor(lengthPercent / 3600);
    const minutes = Math.floor((lengthPercent % 3600) / 60);
    const seconds = lengthPercent % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
}
