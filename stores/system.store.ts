import { defineStore } from 'pinia';

export const useSystemStore = defineStore('system', {
  state: () => ({}),

  getters: {},

  actions: {
    async getAll(videoId: number) {
      const { $trpc } = useNuxtApp();

      let results = await $trpc.system.getAll.query();

      // convert results to object with name as key and value as value
      results = results.reduce((acc, cur) => {
        acc[cur.name] = cur.value;
        return acc;
      }, {});

      return results;
    },

    async update(name: string, value: string) {
      const { $trpc } = useNuxtApp();

      return await $trpc.system.update.mutate({ name, value });
    },
  },
});
