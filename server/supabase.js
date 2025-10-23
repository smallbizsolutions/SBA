import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // full access for server
export const supabase = createClient(supabaseUrl, supabaseKey);

// Expected tables:
//
// documents (id SERIAL PK, name TEXT, mime TEXT, bytes INT, created_at TIMESTAMP DEFAULT now())
// chunks (id SERIAL PK, document_id INT FK, ord INT, text TEXT, embedding JSONB)
