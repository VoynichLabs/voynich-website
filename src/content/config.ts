import { defineCollection, z } from 'astro:content';

const lobsterBlogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: 'date must be ISO 8601 (YYYY-MM-DD)'
      }),
    slug: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'slug must be lowercase kebab-case'),
    tags: z.array(z.string()).optional().default([]),
    summary: z.string().optional()
  })
});

export const collections = {
  'lobster-blog': lobsterBlogCollection
};
