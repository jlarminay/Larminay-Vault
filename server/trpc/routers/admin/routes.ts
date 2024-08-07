import { adminProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';
import { checkFileChanges } from '@/server/utils/checkFileChanges';
import S3 from '@/server/utils/s3';

export const adminRouter = router({
  // item (R)
  ...{
    itemRead: adminProcedure.query(async ({ ctx }) => {
      return await ctx.prisma.item.findMany({
        include: { owner: true },
      });
    }),
  },

  // user (CRU)
  ...{
    userCreate: adminProcedure
      .input(
        z.object({
          name: z.string().max(64),
          email: z.string().max(128),
          provider: z.string(z.enum(['github', 'discord', 'google'])),
          role: z.string(z.enum(['admin', 'user'])),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.user.create({
          data: {
            name: input.name,
            email: input.email,
            provider: input.provider,
            role: input.role,
          },
        });
      }),
    userRead: adminProcedure.query(async ({ ctx }) => {
      return await ctx.prisma.user.findMany();
    }),
    userUpdate: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().max(64),
          email: z.string().max(128),
          provider: z.string(z.enum(['github', 'discord', 'google'])),
          role: z.string(z.enum(['admin', 'user'])),
          active: z.boolean(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.user.update({
          where: { id: input.id },
          data: {
            name: input.name,
            email: input.email,
            provider: input.provider,
            role: input.role,
            active: input.active,
          },
        });
      }),
  },

  // force recheck s3 bucket
  ...{
    getAllFiles: adminProcedure.query(async ({ ctx }) => {
      try {
        const s3Instance = S3.getInstance({
          region: useRuntimeConfig().s3.region || '',
          endpoint: useRuntimeConfig().s3.endpoint || '',
          accessKeyId: useRuntimeConfig().s3.accessKey || '',
          secretAccessKey: useRuntimeConfig().s3.secretKey || '',
        });
        return await s3Instance.getAllFiles();
      } catch (error) {
        return error;
      }
    }),
    forceRecheckS3Bucket: adminProcedure.query(async ({ ctx }) => {
      try {
        return await checkFileChanges();
      } catch (error) {
        return error;
      }
    }),
    refreshAllThumbnails: adminProcedure.query(async ({ ctx }) => {
      try {
        return await checkFileChanges({ updateThumbnailOnly: true });
      } catch (error) {
        return error;
      }
    }),
  },
});

// export type definition of API
export type AdminRouter = typeof adminRouter;
