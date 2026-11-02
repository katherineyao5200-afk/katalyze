import { createClient } from "@supabase/supabase-js";

interface Database {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string;
          email: string;
          created_at: string | null;
          source: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string | null;
          source?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

let client: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseServerClient() {
  if (client) return client;

  // Trimmed: values pasted into the Vercel dashboard often carry a
  // trailing newline or space, which Supabase rejects as an invalid key.
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them in .env.local (see .env.local.example).",
    );
  }

  client = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return client;
}

/*
 * Non-secret facts about the configured key, for the health check: what
 * kind of key it is and which project it belongs to, next to the project
 * the URL points at. Never returns the key itself.
 */
export function describeSupabaseConfig() {
  const url = process.env.SUPABASE_URL?.trim() ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  const urlProject = url.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1] ?? "not a supabase.co URL";
  let keyType = "unknown";
  let keyProject: string | null = null;
  let keyRole: string | null = null;
  if (key.startsWith("sb_secret_")) keyType = "secret (new)";
  else if (key.startsWith("sb_publishable_")) keyType = "publishable (wrong one, use a secret key)";
  else if (key.split(".").length === 3) {
    keyType = "legacy JWT";
    try {
      const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
      keyProject = typeof payload.ref === "string" ? payload.ref : null;
      keyRole = typeof payload.role === "string" ? payload.role : null;
    } catch {
      keyType = "legacy JWT (unreadable, probably cut off when copying)";
    }
  }
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return {
    urlProject,
    keyType,
    keyRole,
    keyProject,
    projectsMatch: keyProject ? keyProject === urlProject : null,
    keyHadSpaces: rawKey !== rawKey.trim(),
  };
}
