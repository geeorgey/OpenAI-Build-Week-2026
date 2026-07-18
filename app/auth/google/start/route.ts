import { getRuntimeEnv, randomToken } from "../../../../lib/db";

export async function GET(request: Request) {
  const runtime = getRuntimeEnv();
  if (!runtime.GOOGLE_CLIENT_ID) {
    return new Response("Google OAuth is not configured yet.", { status: 503 });
  }
  const origin = runtime.APP_BASE_URL || new URL(request.url).origin;
  const state = randomToken();
  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", runtime.GOOGLE_CLIENT_ID);
  authorize.searchParams.set("redirect_uri", `${origin}/auth/google/callback`);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("prompt", "select_account");
  return new Response(null, {
    status: 302,
    headers: {
      location: authorize.toString(),
      "set-cookie": `nep_google_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}
