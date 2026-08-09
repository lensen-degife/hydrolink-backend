import { Response } from "express";

export interface ApiResponseShape<T> {
  success: boolean;
  message: string;
  data: T | null;
  error: string | null;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200
) {
  const body: ApiResponseShape<T> = { success: true, message, data, error: null };
  return res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  error: string | null = null
) {
  const body: ApiResponseShape<null> = {
    success: false,
    message,
    data: null,
    error: error ?? message,
  };
  return res.status(statusCode).json(body);
}
