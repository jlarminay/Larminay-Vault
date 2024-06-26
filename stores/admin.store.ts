import { defineStore } from 'pinia';

export const useAdminStore = defineStore('admin', {
  state: () => ({}),

  getters: {},

  actions: {
    // video (R)
    ...{
      async videoRead() {
        const { $trpc } = useNuxtApp();
        return await $trpc.admin.videoRead.query();
      },
    },

    // file (R)
    ...{
      async filesRead() {
        const { $trpc } = useNuxtApp();
        return await $trpc.admin.filesRead.query();
      },
    },

    // user (CRU)
    ...{
      async userCreate(user: any) {
        const { $trpc } = useNuxtApp();
        return await $trpc.admin.userCreate.mutate(user);
      },
      async userRead() {
        const { $trpc } = useNuxtApp();
        return await $trpc.admin.userRead.query();
      },
      async userUpdate(user: any) {
        const { $trpc } = useNuxtApp();
        return await $trpc.admin.userUpdate.mutate(user);
      },
    },

    // report (RD)
    ...{
      async reportRead() {
        const { $trpc } = useNuxtApp();
        return await $trpc.admin.reportRead.query();
      },
      async reportDelete(id: number) {
        const { $trpc } = useNuxtApp();
        return await $trpc.admin.reportDelete.mutate({ id });
      },
    },
  },
});
