import { z } from "zod";

// Server-side environment schema (only available on server)
const serverEnvSchema = z.object({
  // Auth
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  
  // Stripe (optional)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  
  // Frontend URL
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL"),
  
  // Error monitoring (optional)
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // Email Service (optional)
  RESEND_API_KEY: z.string().optional(),
});

// Client-side environment schema (NEXT_PUBLIC_ vars only)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PRICE_ID: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_WAITLIST_MODE: z
    .string()
    .transform((val) => val === "true")
    .default("false"),
});

type ServerEnv = z.infer<typeof serverEnvSchema>;
type ClientEnv = z.infer<typeof clientEnvSchema>;

// Server-side environment parsing (only run on server)
const parseServerEnv = (): ServerEnv => {
  // Only parse server env on server side
  if (typeof window !== 'undefined') {
    throw new Error("Server environment variables should not be accessed on the client side");
  }
  
  const result = serverEnvSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error("❌ Invalid server environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables");
  }
  
  return result.data;
};

// Client-side environment parsing
const parseClientEnv = (): ClientEnv => {
  const clientEnv = {
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY,
    NEXT_PUBLIC_STRIPE_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    NEXT_PUBLIC_WAITLIST_MODE: process.env.NEXT_PUBLIC_WAITLIST_MODE || "false",
  };

  const result = clientEnvSchema.safeParse(clientEnv);
  
  if (!result.success) {
    console.error("❌ Invalid client environment variables:");
    console.error(result.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables");
  }
  
  return result.data;
};

// Export server env only if on server side
export const env = typeof window === 'undefined' ? parseServerEnv() : {} as ServerEnv;

// Export client env (available on both client and server)
export const clientEnv = parseClientEnv();

// Type exports
export type { ServerEnv, ClientEnv };