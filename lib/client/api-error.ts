export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    throw new APIError("Unexpected empty response", response.status, "EMPTY_RESPONSE");
  }

  return response.json() as Promise<T>;
}

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    let message = "Unknown error";
    let code: string | undefined;

    try {
      const errorData = (await response.json()) as { error?: string; code?: string };
      message = errorData.error || message;
      code = errorData.code;
    } catch {}

    throw new APIError(message, response.status, code);
  }

  return parseResponse<T>(response);
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url),
  post: <T>(url: string, data: unknown) =>
    apiRequest<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  put: <T>(url: string, data: unknown) =>
    apiRequest<T>(url, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: <T>(url: string) =>
    apiRequest<T>(url, {
      method: "DELETE",
    }),
};
