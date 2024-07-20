import { protectedProcedure, router } from '@/server/trpc/trpc';
import { getServerSession } from '#auth';
import { z } from 'zod';
import { searchSchema, editItemSchema } from './schema';
import dayjs from 'dayjs';

export const itemRouter = router({
  search: protectedProcedure.input(searchSchema).query(async ({ input, ctx }) => {
    const session = await getServerSession(ctx.event);
    const page = input.page || 1;
    const limit = 30;

    const items = await ctx.prisma.item.findMany({
      where: {
        OR: [
          { ownerId: session?.id },
          { published: 'public' },
          {
            AND: [{ published: 'allow-few' }, { allowList: { some: { id: session?.id } } }],
          },
        ],
      },
      include: {
        like: {
          select: {
            userId: true,
          },
        },
        allowList: {
          select: {
            id: true,
            name: true,
          },
        },
        blockList: {
          select: {
            id: true,
            name: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // filter and sort items
    const cleanedItems = items
      .filter((item) => {
        // search field
        if (input.search) {
          // check if search is for file name
          if (input.search.startsWith('file:')) {
            const search = input.search.split('file:')[1].trim();
            if (
              !item.name.toLowerCase().includes(search.toLowerCase()) &&
              !item.path.toLowerCase().includes(search.toLowerCase())
            ) {
              return false;
            }
          }
          // check for people
          else if (input.search.startsWith('person:')) {
            const search = input.search.split('person:')[1].trim();
            if (!item.people?.toLowerCase().includes(search.toLowerCase())) {
              return false;
            }
          }
          // check if search is for anything else
          else if (
            !(
              item.description?.toLowerCase().includes(input.search.toLowerCase()) ||
              item.people?.toLowerCase().includes(input.search.toLowerCase())
            )
          ) {
            return false;
          }
        }

        // filter by likes
        if (input.filterBy === 'liked' && !item.like.some((like) => like.userId === session?.id)) {
          return false;
        }
        // filter by private
        if (input.filterBy === 'private' && item.published === 'public') {
          return false;
        }

        return true;
      })
      .map((item) => {
        return {
          ...item,
          // takenAt: dayjs(item.takenAt).format('YYYY-MM-DD') as string,
          // createdAt: dayjs(item.createdAt).format('YYYY-MM-DD') as string,
          like: item.like.length,
        };
      })
      .sort((a: any, b: any) => {
        if (input.sortBy === 'date-taken-desc') {
          const dateDiff = dayjs(b.takenAt).diff(dayjs(a.takenAt));
          if (dateDiff !== 0) return dateDiff;
          return a.name.localeCompare(b.name);
        }
        if (input.sortBy === 'date-added-desc') {
          const dateDiff = dayjs(b.createdAt).diff(dayjs(a.createdAt));
          if (dateDiff !== 0) return dateDiff;
          return a.name.localeCompare(b.name);
        }
      });

    return {
      page: page,
      count: cleanedItems.length,
      items: cleanedItems.slice((page - 1) * limit, page * limit),
    };
  }),

  getSingle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getServerSession(ctx.event);

      const item = await ctx.prisma.item.findUniqueOrThrow({
        where: {
          id: input.id,
          AND: [
            // allow admin to see any item, but they must have the url
            // the items won't show in search results
            session?.role !== 'admin'
              ? {
                  OR: [
                    { ownerId: session?.id },
                    { published: 'public' },
                    {
                      AND: [
                        { published: 'allow-few' },
                        { allowList: { some: { id: session?.id } } },
                      ],
                    },
                  ],
                }
              : {},
          ],
        },
        include: {
          like: {
            select: {
              userId: true,
            },
          },
          owner: {
            select: {
              name: true,
              avatar: true,
            },
          },
          allowList: {
            select: {
              id: true,
              name: true,
            },
          },
          blockList: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!item.published && item.ownerId !== session?.id && session?.role !== 'admin') {
        throw new Error('Item not published');
      }

      return {
        ...item,
        // takenAt: dayjs(item.takenAt).format('YYYY-MM-DD') as string,
        // createdAt: dayjs(item.createdAt).format('YYYY-MM-DD') as string,
        like: item.like.length,
      };
    }),

  incrementViewCount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerSession(ctx.event);
      if (!session) throw new Error('Unauthorized');

      // add view to item
      await ctx.prisma.item.update({
        where: { id: input.id },
        data: {
          view: {
            increment: 1,
          },
        },
      });

      // add view to user
      await ctx.prisma.user.update({
        where: { id: session.id },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      // add to history
      await ctx.prisma.history.create({
        data: {
          userId: session.id,
          itemId: input.id,
        },
      });
    }),

  update: protectedProcedure.input(editItemSchema).mutation(async ({ ctx, input }) => {
    const session = await getServerSession(ctx.event);

    // is user the owner
    const item = await ctx.prisma.item.findUnique({ where: { id: input.id } });
    if (item && item.ownerId !== session?.id) {
      throw new Error('Forbidden');
    }

    // clear list if public or private
    if (input.published === 'public' || input.published === 'private') {
      input.allowList = [];
    }

    return await ctx.prisma.item.update({
      where: { id: input.id },
      data: {
        description: input.description,
        people: input.people,
        dateEstimate: input.dateEstimate || false,
        takenAt: input.takenAt,
        published: input.published,
        allowList: {
          set: input.allowList?.map((user: any) => ({ id: user })) || [],
        },
      },
    });
  }),
});

// export type definition of API
export type ItemRouter = typeof itemRouter;
