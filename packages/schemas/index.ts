import z from "zod";

export const RegisterSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const AddMonitorSchema = z.object({
  url: z.url({ error: "Invalid URL" }),
  name: z.string({ error: "Name is required" }),
});
