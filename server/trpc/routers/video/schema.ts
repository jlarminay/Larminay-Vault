import { z } from 'zod';

export const searchSchema = z.object({
  search: z.string().max(128),
  filterBy: z.string(z.enum(['all', 'liked', 'mine'])),
  sortBy: z.string(
    z.enum([
      'title-asc',
      'title-desc',
      'date-taken-desc',
      'date-taken-asc',
      'date-added-desc',
      'date-added-asc',
      'duration-desc',
      'duration-asc',
    ]),
  ),
  page: z.number(),
});

export const editVideoSchema = z.object({
  id: z.number(),
  title: z.string().max(128),
  description: z.string().max(1024).nullable().optional(),
  people: z.string().max(1024).nullable().optional(),
  tags: z.string().max(1024).nullable().optional(),
  dateDisplay: z.string().max(64).nullable().optional(),
  dateOrder: z.coerce.date(),
  originalFormat: z
    .string(z.enum(['VHS', 'VHS-C', 'Video 8', 'Super 8', '8mm', 'Phone', 'Other']))
    .nullable()
    .optional(),
  published: z.string(z.enum(['public', 'private', 'allow-few', 'deny-few'])),
  allowList: z.array(z.number()).nullable().optional(),
  blockList: z.array(z.number()).nullable().optional(),
});
