import { useState } from "react";
import { Link, redirect, useNavigate } from "react-router";
import { authClient } from "../../src/lib/authClient";
import { auth } from "../../src/server/auth";
import type { Route } from "./+types/sign-in";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (session) throw redirect("/");
  return {};
}

export default function SignIn() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const { error } = await authClient.signIn.email({
      email: data.get("email") as string,
      password: data.get("password") as string,
    });
    if (error) {
      setError(error.message ?? "Invalid email or password");
      setPending(false);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-neutral-100 tracking-tight">ML Learning</h1>
          <p className="mt-2 text-sm text-neutral-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm text-neutral-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm text-neutral-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-500">
          No account?{" "}
          <Link to="/sign-up" className="text-neutral-300 hover:text-white transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
