import z from "zod";

export const authBodySchema = z.object({
  email: z.email(),
});
