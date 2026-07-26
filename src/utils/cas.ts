import { parseStringPromise, processors } from "xml2js";
import { env } from "../config/env";
import { AppError, UnauthorizedError } from "./errors";

export interface CasProfile {
  netid: string;
  email: string;
}

/** Absolute callback URL registered as the CAS "service". */
export const CAS_CALLBACK_URL = `${env.CAS_SERVICE_URL}/auth/cas/callback`;

interface CasServiceResponse {
  serviceresponse?: {
    authenticationsuccess?: {
      user?: string;
      attributes?: Record<string, string>;
    };
    authenticationfailure?: unknown;
  };
}

/**
 * Validates a CAS service ticket against the CAS3.0 `serviceValidate`
 * endpoint and returns the authenticated user's NetID and email.
 *
 * Implemented directly (HTTP + XML parsing) instead of via `passport`/
 * `passport-cas`: that library is unmaintained since ~2014 and calls the
 * Express 3/4-only `req.param()` API (removed in Express 5), and merely
 * importing `passport`'s types globally augments `Express.Request` in a
 * way that breaks TypeScript's overload resolution for unrelated routes
 * elsewhere in this app. Both packages remain installed per Story 1.1 but
 * are unused at runtime.
 */
export async function verifyCasTicket(
  ticket: string,
  service: string
): Promise<CasProfile> {
  const validateUrl = new URL(`${env.CAS_BASE_URL}/p3/serviceValidate`);
  validateUrl.searchParams.set("ticket", ticket);
  validateUrl.searchParams.set("service", service);

  const response = await fetch(validateUrl.toString()).catch(() => {
    throw new AppError(502, "CAS service is unreachable", "CAS_UNAVAILABLE");
  });
  const body = await response.text();

  let parsed: CasServiceResponse;
  try {
    parsed = await parseStringPromise(body, {
      trim: true,
      explicitArray: false,
      tagNameProcessors: [processors.stripPrefix, processors.normalize],
    });
  } catch {
    throw new UnauthorizedError("CAS returned an unparseable response");
  }

  const success = parsed.serviceresponse?.authenticationsuccess;
  if (!success?.user) {
    throw new UnauthorizedError("CAS ticket validation failed");
  }

  const netid = success.user;
  const email =
    success.attributes?.mail ?? success.attributes?.email ?? `${netid}@umass.edu`;

  return { netid, email };
}
