export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
}

/** Extrae el ProblemDetail (RFC 9457) que devuelve la API dentro de un HttpErrorResponse. */
export function readProblem(error: unknown): ProblemDetail | null {
  if (typeof error === 'object' && error !== null && 'error' in error) {
    const body = (error as { error?: unknown }).error;
    if (typeof body === 'object' && body !== null) {
      return body as ProblemDetail;
    }
  }
  return null;
}

/** Mensaje legible para el usuario a partir del error HTTP. */
export function problemMessage(error: unknown, fallback: string): string {
  const problem = readProblem(error);
  return problem?.detail ?? problem?.title ?? fallback;
}
