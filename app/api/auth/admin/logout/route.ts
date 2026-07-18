export async function POST() {
  return Response.json(
    { ok: true },
    {
      headers: {
        "cache-control": "no-store",
        "set-cookie": "nep_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
      },
    },
  );
}
