import { z } from "zod";

const nullableString = z.string().trim().optional().transform((value) => value || null);

export const submissionSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(80),
  postcode: z.string().trim().min(2).max(12),
  facility_type: z.enum(["outdoor", "indoor", "both"]),
  bays: z.coerce.number().int().positive().max(1000).optional().nullable(),
  covered_bays: z.boolean().optional().nullable(),
  floodlights: z.boolean().optional().nullable(),
  short_game_area: z.boolean().optional().nullable(),
  simulator_brand: nullableString,
  price_100_balls: z.coerce.number().min(0).max(1000).optional().nullable(),
  website: nullableString,
  phone: nullableString,
  opening_hours: nullableString,
  images: z.array(z.string().url()).max(6).optional(),
  submitter_email: z.string().email().optional().or(z.literal("")).transform((value) => value || null),
  honeypot: z.string().optional(),
});

export type SubmissionSchemaInput = z.infer<typeof submissionSchema>;
