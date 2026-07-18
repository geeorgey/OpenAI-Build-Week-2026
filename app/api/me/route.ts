import { getIdentityFromRequest } from "../../../lib/auth";

export async function GET(request: Request) {
  const identity = await getIdentityFromRequest(request);
  return Response.json({ identity });
}
