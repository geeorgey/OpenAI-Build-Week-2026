import { cookies } from "next/headers";
import { getIdentityFromRequest, getServerIdentity, isAdmin } from "./auth";
import { ensureDatabase, getDatabase, PRESENTATION_SLUG } from "./db";

type PresentationAccess = {
  visibility: "public" | "password" | "private";
  passwordHash: string | null;
};

async function getAccessRecord(): Promise<PresentationAccess> {
  const database = getDatabase();
  await ensureDatabase(database);
  const row = await database.prepare(
    "SELECT visibility, password_hash AS passwordHash FROM presentations WHERE slug = ?",
  ).bind(PRESENTATION_SLUG).first<PresentationAccess>();
  return row ?? { visibility: "public", passwordHash: null };
}

export async function getServerAccessState() {
  try {
    const record = await getAccessRecord();
    if (record.visibility === "public") return { allowed: true, visibility: record.visibility };
    const identity = await getServerIdentity();
    if (isAdmin(identity)) return { allowed: true, visibility: record.visibility };
    if (record.visibility === "private") return { allowed: false, visibility: record.visibility };
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("nep_access")?.value;
    return {
      allowed: Boolean(accessToken && record.passwordHash && accessToken === record.passwordHash),
      visibility: record.visibility,
    };
  } catch {
    return { allowed: true, visibility: "public" as const };
  }
}

export async function requestHasPresentationAccess(request: Request) {
  try {
    const record = await getAccessRecord();
    if (record.visibility === "public") return true;
    const identity = await getIdentityFromRequest(request);
    if (isAdmin(identity)) return true;
    if (record.visibility === "private") return false;
    const cookie = request.headers.get("cookie")?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith("nep_access="));
    const accessToken = cookie ? decodeURIComponent(cookie.slice("nep_access=".length)) : null;
    return Boolean(accessToken && record.passwordHash && accessToken === record.passwordHash);
  } catch {
    return true;
  }
}
