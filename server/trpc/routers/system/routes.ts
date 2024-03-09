import { protectedProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';

export const systemRouter = router({
  getAll: protectedProcedure.query(async ({ ctx, input }) => {
    return await ctx.prisma.system.findMany();
  }),
  update: protectedProcedure
    .input(z.object({ name: z.string(), value: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.system.update({
        where: { name: input.name },
        data: { value: input.value },
      });
    }),
});

// export type definition of API
export type LikeRouter = typeof likeRouter;
