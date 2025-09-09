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
    <div style={{ maxWidth: 360, margin: "80px auto" }}>
      <h1 style={{ marginBottom: 12 }}>Sign up with Magic Link</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        Enter your email to receive a login link.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        style={{ display: "grid", gap: 12 }}
      >
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "10px 12px",
            border: "1px solid #e5e5e5",
            borderRadius: 8,
          }}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send magic link"}
        </Button>
      </form>
      {isSuccess ? (
        <p style={{ marginTop: 16, color: "#0a7" }}>
          Email sent. Check your inbox and follow the link to log in.
        </p>
      ) : null}
      {error ? (
        <p style={{ marginTop: 16, color: "#d00" }}>
          {(error as Error).message || "Something went wrong"}
        </p>
      ) : null}
    </div>
  );
}
