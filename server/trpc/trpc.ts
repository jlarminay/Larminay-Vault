import { TRPCError, initTRPC } from '@trpc/server';
import { type Context } from '@/server/trpc/context';
import { getServerSession } from '#auth';

const t = initTRPC.context<Context>().create();
export const router = t.router;
export const middleware = t.middleware;

const authorize = middleware(async ({ ctx, next }) => {
  const session = await getServerSession(ctx.event);

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx,
  });
});

const adminAuthorize = middleware(async ({ ctx, next }) => {
  const session = await getServerSession(ctx.event);

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  if (session.role !== 'admin') {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be an admin to access this resource',
    });
  }

  return next({
    ctx,
  });
});

export const publicProcedure = t.procedure;
export const protectedProcedure = publicProcedure.use(authorize);
export const adminProcedure = publicProcedure.use(adminAuthorize);
