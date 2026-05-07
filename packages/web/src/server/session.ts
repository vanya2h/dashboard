import { redirect } from "react-router";
import { auth } from "./auth";

export async function requireSession(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    const url = new URL(request.url);
    const target = `${url.pathname}${url.search}`;
    throw redirect(`/sign-in?redirect=${encodeURIComponent(target)}`);
  }
  return session;
}
