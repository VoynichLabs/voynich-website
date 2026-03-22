import { defineCollection, z } from 'astro:content';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const lobsterBlogCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      title: z.string(),
      date: z
        .string()
        .refine((value) => !Number.isNaN(Date.parse(value)), {
          message: 'date must be ISO 8601 (YYYY-MM-DD)'
        }),
      slug: z
        .string()
        .regex(slugRegex, 'slug must be lowercase kebab-case')
        .optional(),
      tags: z.array(z.string()).default([]),
      summary: z.string().optional(),
      author: z.string().optional(),
      image: z.string().optional()
    })
});

const researchCollection = defineCollection({
  type: 'content',
  schema: () =>
    z.object({
      title: z.string(),
      date: z.string().refine((v) => !Number.isNaN(Date.parse(v)), { message: 'date must be ISO 8601' }),
      slug: z.string().regex(slugRegex, 'slug must be lowercase kebab-case').optional(),
      authors: z.array(z.string()).default([]),
      tags: z.array(z.string()).default([]),
      abstract: z.string().optional(),
      summary: z.string().optional(),
      status: z.enum(['preprint', 'published', 'draft']).default('preprint'),
    })
});

export const collections = {
  'lobster-blog': lobsterBlogCollection,
  'research': researchCollection,
};
