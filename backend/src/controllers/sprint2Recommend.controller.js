import { z } from "zod";
import { createSprint2Recommendation } from "../services/recommendation/sprint2RecommendationService.js";

const schema = z.object({ query: z.string().min(5).max(10000), document_id: z.string().uuid().nullable().optional() });

export async function handleSprint2Recommend(req, res, next) {
  try {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { message: "query is required and must be 5-10,000 characters" } });
    const result = await createSprint2Recommendation(parsed.data.query, { documentId: parsed.data.document_id || null });
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.statusCode === 400) return res.status(400).json({ success: false, error: { message: error.message } });
    next(error);
  }
}
