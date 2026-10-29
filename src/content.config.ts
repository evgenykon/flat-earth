import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const argumentsSchema = z.object({
  title: z.string(),
  claim: z.string().optional(),
  argument: z.string().optional(),
  thesis: z.string().optional(),
  category: z.string().optional(),
  order: z.number().optional(),
});

const light = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/light' }),
  schema: argumentsSchema,
});

const dark = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/dark' }),
  schema: argumentsSchema,
});

export const collections = { light, dark };
