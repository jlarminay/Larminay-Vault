import { protectedProcedure, router } from '@/server/trpc/trpc';
import { getServerSession } from '#auth';
import { z } from 'zod';
import { searchSchema, editVideoSchema } from './schema';

export const videoRouter = router({
  search: protectedProcedure.input(searchSchema).query(async ({ input, ctx }) => {
    const session = await getServerSession(ctx.event);
    const page = input.page || 1;
    const limit = 10;

    const videos = await ctx.prisma.video.findMany({
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
        video: true,
        thumbnail: true,
        likes: {
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
          },
        },
      },
    });

    // filter and sort videos
    const cleanedVideos = videos
      .filter((video) => {
        // search field
        if (input.search) {
          // check if search is for file name
          if (input.search.startsWith('file:')) {
            const search = input.search.split('file:')[1].trim();
            if (!video.video?.name.toLowerCase().includes(search.toLowerCase())) {
              return false;
            }
          }
          // check for people
          else if (input.search.startsWith('person:')) {
            const search = input.search.split('person:')[1].trim();
            if (!video.people?.toLowerCase().includes(search.toLowerCase())) {
              return false;
            }
          }
          // check if search is for anything else
          else if (
            !(
              video.title.toLowerCase().includes(input.search.toLowerCase()) ||
              video.description?.toLowerCase().includes(input.search.toLowerCase()) ||
              video.people?.toLowerCase().includes(input.search.toLowerCase())
            )
          ) {
            return false;
          }
        }

        // filter by likes
        if (
          input.filterBy === 'liked' &&
          !video.likes.some((like) => like.userId === session?.id)
        ) {
          return false;
        }
        // filter by private
        if (input.filterBy === 'private' && video.published === 'public') {
          return false;
        }

        return true;
      })
      .map((video) => {
        return {
          ...video,
          // clean date before returning
          dateOrder: video.dateOrder.toISOString().split('T')[0] as any,
          // clean thumbnail url
          thumbnail: video.thumbnail || { path: 'https://placehold.co/640x360?text=Processing...' },
        };
      })
      .sort((a: any, b: any) => {
        if (input.sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        if (input.sortBy === 'title-desc') {
          return b.title.localeCompare(a.title);
        }
        if (input.sortBy === 'date-taken-desc') {
          return new Date(b.dateOrder).getTime() - new Date(a.dateOrder).getTime();
        }
        if (input.sortBy === 'date-taken-asc') {
          return new Date(a.dateOrder).getTime() - new Date(b.dateOrder).getTime();
        }
        if (input.sortBy === 'date-added-desc') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (input.sortBy === 'date-added-asc') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (input.sortBy === 'duration-desc') {
          return b.video?.metadata?.duration - a.video?.metadata?.duration;
        }
        if (input.sortBy === 'duration-asc') {
          return a.video?.metadata?.duration - b.video?.metadata?.duration;
        }
      });

    return {
      page: page,
      count: cleanedVideos.length,
      videos: cleanedVideos.slice((page - 1) * limit, page * limit),
    };
  }),

  getRelated: protectedProcedure
    .input(z.object({ currentId: z.number(), limit: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getServerSession(ctx.event);
      const { limit } = input;

      const currentVideo = await ctx.prisma.video.findUniqueOrThrow({
        where: {
          id: input.currentId,
        },
      });
      const allVideos = await ctx.prisma.video.findMany({
        where: {
          AND: [
            { id: { not: input.currentId } }, // exclude current video
            {
              OR: [
                { ownerId: session?.id },
                { published: 'public' },
                {
                  AND: [{ published: 'allow-few' }, { allowList: { some: { id: session?.id } } }],
                },
              ],
            },
          ],
        },
        include: {
          video: true,
          thumbnail: true,
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
            },
          },
        },
      });

      // somehow filter based on if the video is related to the current video

      return allVideos.sort(() => Math.random() - Math.random()).slice(0, limit);
    }),

  getSingle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const session = await getServerSession(ctx.event);

      const video = await ctx.prisma.video.findUniqueOrThrow({
        where: {
          id: input.id,
          AND: [
            // allow admin to see any video, but they must have the url
            // the videos won't show in search results
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
          video: true,
          thumbnail: true,
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

      // clean date before returning
      video.dateOrder = video.dateOrder.toISOString().split('T')[0] as any;

      if (!video.published && video.ownerId !== session?.id && session?.role !== 'admin') {
        throw new Error('Video not published');
      }

      return video;
    }),

  incrementViewCount: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const session = await getServerSession(ctx.event);
      if (!session) throw new Error('Unauthorized');

      // add view to video
      await ctx.prisma.video.update({
        where: { id: input.id },
        data: {
          views: {
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
          videoId: input.id,
        },
      });
    }),

  update: protectedProcedure.input(editVideoSchema).mutation(async ({ ctx, input }) => {
    const session = await getServerSession(ctx.event);

    // is user the owner
    const video = await ctx.prisma.video.findUnique({ where: { id: input.id } });
    if (video && video.ownerId !== session?.id) {
      throw new Error('Forbidden');
    }

    // clear list if public or private
    if (input.published === 'public' || input.published === 'private') {
      input.allowList = [];
    }

    return await ctx.prisma.video.update({
      where: { id: input.id },
      data: {
        title: input.title,
        description: input.description,
        people: input.people,
        tags: input.tags,
        dateDisplay: input.dateDisplay,
        dateOrder: input.dateOrder,
        originalFormat: input.originalFormat,
        published: input.published,
        allowList: {
          set: input.allowList?.map((user) => ({ id: user })) || [],
        },
      },
    });
  }),
});

// export type definition of API
export type VideoRouter = typeof videoRouter;
