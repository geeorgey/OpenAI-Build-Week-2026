import { createVerifiedSession } from "../../../../lib/auth";

export async function GET(request: Request) {
  const email = request.headers.get("oai-authenticated-user-email");
  if (!email) {
    const returnTo = encodeURIComponent("/auth/chatgpt/complete");
    return Response.redirect(new URL(`/signin-with-chatgpt?return_to=${returnTo}`, request.url));
  }
  const encodedName = request.headers.get("oai-authenticated-user-full-name");
  const displayName = encodedName ? decodeURIComponent(encodedName) : email.split("@")[0];
  const session = await createVerifiedSession({
    email,
    displayName,
    provider: "chatgpt",
  });
  return new Response(null, {
    status: 302,
    headers: {
      location: "/mypage",
      "set-cookie": session.cookie,
    },
  });
}
