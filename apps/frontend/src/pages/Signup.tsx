import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: async () => {
      await api.post("/auth/signup", { email });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-semibold text-foreground">
          Sign up with Magic Link
        </h1>
        <p className="mb-5 text-center text-muted-foreground">
          Enter your email to receive a secure login link.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate();
          }}
          className="grid gap-3"
        >
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm text-foreground">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border bg-background px-3 py-2 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
            />
          </div>
          <Button type="submit" disabled={isPending} className="h-11 w-full">
            {isPending ? "Sending..." : "Send magic link"}
          </Button>
        </form>
        {isSuccess ? (
          <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            Email sent. Check your inbox and follow the link to log in.
          </div>
        ) : null}
        {error ? (
          <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {(error as Error).message || "Something went wrong"}
          </div>
        ) : null}
      </div>
    </div>
  );
}
