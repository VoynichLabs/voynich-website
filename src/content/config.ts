import { defineCollection, z } from 'astro:content';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const lobsterBlogCollection = defineCollection({
  type: 'content',
  schema: ({ slug }) =>
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
        .optional()
        .default(slug),
      tags: z.array(z.string()).default([]),
      summary: z.string().optional()
    })
});

export const collections = {
  'lobster-blog': lobsterBlogCollection
};
