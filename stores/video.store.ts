import { defineStore } from 'pinia';
import fs from 'fs';
import video from '~/prisma/seeds/video';

export const useVideoStore = defineStore('video', {
  state: () => ({
    uploadState: {
      state: 'idle',
      progress: 0,
    },
  }),

  getters: {},

  actions: {
    async getAllPublic() {
      const { $trpc } = useNuxtApp();

      let results = await $trpc.video.getAllPublic.query();
      results = results.map((video: any) => {
        return {
          ...video,
          // clean thumbnail url
          thumbnail: video.thumbnail || { path: 'https://placehold.co/640x360' },
        };
      });

      return results;
    },
    async getAllLiked() {
      const { $trpc } = useNuxtApp();

      let results = await $trpc.video.getAllLiked.query();
      results = results.map((video: any) => {
        return {
          ...video,
          // clean thumbnail url
          thumbnail: video.thumbnail || { path: 'https://placehold.co/640x360' },
        };
      });

      return results;
    },
    async getAllMine() {
      const { $trpc } = useNuxtApp();

      let results = await $trpc.video.getAllMine.query();
      results = results.map((video: any) => {
        return {
          ...video,
          // clean thumbnail url
          thumbnail: video.thumbnail || { path: 'https://placehold.co/640x360' },
        };
      });

      return results;
    },

    async getRandom(limit: number, ignore: number | undefined = undefined) {
      const { $trpc } = useNuxtApp();

      let results = await $trpc.video.getRandom.query({ limit });
      results = results
        .filter((video: any) => {
          return video.id !== ignore;
        })
        .map((video: any) => {
          return {
            ...video,
            // clean thumbnail url
            thumbnail: video.thumbnail || 'https://placehold.co/640x360',
          };
        });

      return results;
    },

    async getSingle(id: number) {
      const { $trpc } = useNuxtApp();

      let results = await $trpc.video.getSingle.query({ id });
      return {
        ...results,
        // clean thumbnail url
        thumbnail: results.thumbnail || { path: 'https://placehold.co/640x360' },
      };
    },
    async update(videoData: any) {
      const { $trpc } = useNuxtApp();

      let results = await $trpc.video.update.mutate({
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        dateDisplay: videoData.dateDisplay,
        dateOrder: videoData.dateOrder,
        persons: videoData.persons.map((person: any) => person.value),
        collections: videoData.collections.map((collection: any) => collection.value),
        published: videoData.published === 'Yes' ? true : false,
      });
      return results;
    },

    async uploadVideo(video: any) {
      const { $trpc } = useNuxtApp();

      this.uploadState.state = 'uploading';

      const key =
        Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
      const chunkSize = 2 * 1024 * 1024;
      let start = 0;
      let i = 1;

      while (start < video.data.size) {
        const chunk = video.data.slice(start, start + chunkSize);
        const arrayBuffer = await new Response(chunk).arrayBuffer();
        const base64String = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''),
        );

        $trpc.video.uploadVideo.mutate({
          key,
          count: i,
          packet: base64String,
        });
        start += chunkSize;
        i++;

        this.uploadState.progress = Math.min(Math.floor((start / video.data.size) * 100), 100);
      }

      // all api calls are done, wait a second to let let the server process
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.uploadState.state = 'processing';

      let response = await $trpc.video.processVideo.mutate({
        key,
        name: video.data.name,
        packets: i - 1,
      });

      if (this.uploadState.state !== 'idle') this.uploadState.state = 'complete';

      return response;
    },
  },
});
