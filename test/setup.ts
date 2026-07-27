import { env } from "../src/config/env";

// Set test environment variables for all integration tests
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/um_squared_test";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret-key-for-testing-only";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "test-refresh-secret-key-for-testing-only";
process.env.JWT_ACCESS_TTL = process.env.JWT_ACCESS_TTL || "15m";
process.env.JWT_REFRESH_TTL = process.env.JWT_REFRESH_TTL || "7d";
process.env.CAS_BASE_URL = process.env.CAS_BASE_URL || "https://cas.test.local";
process.env.CAS_SERVICE_URL = process.env.CAS_SERVICE_URL || "http://localhost:3000";
process.env.PORT = process.env.PORT || "3000";
