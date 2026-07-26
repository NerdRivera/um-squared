const requiredEnvVars: string[] = [
  "DATABASE_URL",
  "JWT_SECRET",
  "CAS_BASE_URL",
  "CAS_SERVICE_URL",
  "PORT",
];

const missing: string[] = [];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missing.push(envVar);
  }
}

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  CAS_BASE_URL: process.env.CAS_BASE_URL!,
  CAS_SERVICE_URL: process.env.CAS_SERVICE_URL!,
  PORT: parseInt(process.env.PORT || "3000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
