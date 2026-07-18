import { createVerifiedSession } from "../../../../lib/auth";
import { getRuntimeEnv } from "../../../../lib/db";

function cookieValue(cookieHeader: string | null, name: string) {
  const item = cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = cookieValue(request.headers.get("cookie"), "nep_google_state");
  if (!code || !state || !expectedState || state !== expectedState) {
    return new Response("Invalid OAuth state.", { status: 400 });
  }

  const runtime = getRuntimeEnv();
  if (!runtime.GOOGLE_CLIENT_ID || !runtime.GOOGLE_CLIENT_SECRET) {
    return new Response("Google OAuth is not configured.", { status: 503 });
  }
  const origin = runtime.APP_BASE_URL || url.origin;
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: runtime.GOOGLE_CLIENT_ID,
      client_secret: runtime.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${origin}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenResponse.ok) return new Response("Google token exchange failed.", { status: 502 });
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) return new Response("Google access token is missing.", { status: 502 });

  const userResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { authorization: `Bearer ${token.access_token}` },
  });
  if (!userResponse.ok) return new Response("Google user profile failed.", { status: 502 });
  const profile = await userResponse.json() as {
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  if (!profile.email || !profile.email_verified) {
    return new Response("A verified Google email is required.", { status: 403 });
  }

  const session = await createVerifiedSession({
    email: profile.email,
    displayName: profile.name || profile.email.split("@")[0],
    provider: "google",
  });
  return new Response(null, {
    status: 302,
    headers: {
      location: "/mypage",
      "set-cookie": `${session.cookie}, nep_google_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`,
    },
  });
}
