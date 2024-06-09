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
  persons: z.array(z.number()),
  collections: z.array(z.number()),
});

export const uploadVideoSchema = z.object({
  key: z.string().max(128),
  count: z.number(),
  packet: z.any(),
});

export const processVideoSchema = z.object({
  key: z.string().max(128),
  packets: z.number(),
  name: z.string().max(128),
});

export const editVideoSchema = z.object({
  id: z.number(),
  title: z.string().max(128),
  description: z.string().max(1024).nullable().optional(),
  dateDisplay: z.string().max(64).nullable().optional(),
  dateOrder: z.coerce.date(),
  persons: z.array(z.number()).nullable().optional(),
  collections: z.array(z.number()).nullable().optional(),
  published: z.string(z.enum(['public', 'private', 'allow-few', 'deny-few'])),
  allowList: z.array(z.number()).nullable().optional(),
});
