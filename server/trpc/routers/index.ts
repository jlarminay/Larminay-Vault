import { router } from '@/server/trpc/trpc';

import { systemRouter } from './system/routes';
import { videoRouter } from './video/routes';
import { commentRouter } from './comment/routes';
import { personRouter } from './person/routes';
import { likeRouter } from './like/routes';
import { reportRouter } from './report/routes';
import { userRouter } from './user/routes';
import { collectionRouter } from './collection/routes';

export const appRouter = router({
  system: systemRouter,
  video: videoRouter,
  comment: commentRouter,
  person: personRouter,
  like: likeRouter,
  report: reportRouter,
  user: userRouter,
  collection: collectionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
