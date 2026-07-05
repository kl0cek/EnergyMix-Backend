import type { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Something went wrong.' });
};
