import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Accept either the project origin or a legacy REST endpoint value in .env.
const url = (process.env.SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "");
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for server-side Supabase access.");
}

export const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export default supabase;
