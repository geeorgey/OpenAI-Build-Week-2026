import { ADMIN_EMAILS, createAdminSession } from "../../../../../lib/auth";
import { getRuntimeEnv, sha256 } from "../../../../../lib/db";

async function secretMatches(submitted: string, configured: string) {
  const [submittedHash, configuredHash] = await Promise.all([
    sha256(submitted),
    sha256(configured),
  ]);
  let difference = submittedHash.length ^ configuredHash.length;
  for (let index = 0; index < Math.max(submittedHash.length, configuredHash.length); index += 1) {
    difference |= submittedHash.charCodeAt(index) ^ configuredHash.charCodeAt(index);
  }
  return difference === 0;
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null) as {
    email?: string;
    password?: string;
  } | null;
  const email = payload?.email?.trim().toLowerCase() ?? "";
  const password = payload?.password ?? "";
  const configuredPassword = getRuntimeEnv().ADMIN_PASSWORD;

  if (!configuredPassword) {
    return Response.json(
      { error: "管理者ログインは現在設定中です。" },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const passwordIsValid = await secretMatches(password.slice(0, 512), configuredPassword);
  if (!ADMIN_EMAILS.has(email) || !passwordIsValid) {
    return Response.json(
      { error: "IDまたはパスワードが正しくありません。" },
      { status: 401, headers: { "cache-control": "no-store" } },
    );
  }

  const session = await createAdminSession(email);
  return Response.json(
    { ok: true, email },
    {
      headers: {
        "cache-control": "no-store",
        "set-cookie": session.cookie,
      },
    },
  );
}
