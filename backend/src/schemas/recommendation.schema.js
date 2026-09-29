import { z } from "zod";

export const recommendRequestSchema = z.object({
  text: z.string().optional(),
  requirementText: z.string().optional(),
  language: z.string().optional().default("en"),
  documentId: z.string().nullable().optional(),
  userId: z.string().optional(),
});

export const recommendationDecisionSchema = z.object({
  status: z.enum([
    "ACCEPTED",
    "UNDER_TECHNICAL_REVIEW",
    "CLARIFICATION_REQUESTED",
    "NOT_APPLICABLE",
  ]),
  notes: z.string().optional(),
});
