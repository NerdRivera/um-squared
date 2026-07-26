import type { AxiosError } from "axios";

interface ApiErrorBody {
  error?: string;
  details?: string[];
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "isAxiosError" in err) {
    const axiosErr = err as AxiosError<ApiErrorBody>;
    const data = axiosErr.response?.data;
    if (data?.details?.length) {
      return data.details.join("; ");
    }
    if (data?.error) {
      return data.error;
    }
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Something went wrong. Please try again.";
}
