import { NextResponse, type NextRequest } from "next/server";
import { getAnonServerClient, getServiceRoleClient } from "@/lib/supabase/server";

export interface AdminUser {
  id: string;
  email: string | null;
  role: "admin" | "editor";
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return authorization.slice(7).trim();
}

export async function requireAdminFromRequest(
  request: NextRequest,
): Promise<{ admin: AdminUser } | { error: NextResponse }> {
  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return {
      error: NextResponse.json({ error: "Missing bearer token" }, { status: 401 }),
    };
  }

  const anonClient = getAnonServerClient();
  const serviceClient = getServiceRoleClient();

  if (!anonClient || !serviceClient) {
    return {
      error: NextResponse.json(
        { error: "Supabase environment is not configured" },
        { status: 503 },
      ),
    };
  }

  const {
    data: { user },
    error: authError,
  } = await anonClient.auth.getUser(accessToken);

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profileError || !profile || !["admin", "editor"].includes(profile.role)) {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    admin: {
      id: user.id,
      email: user.email ?? null,
      role: profile.role,
    },
  };
}
