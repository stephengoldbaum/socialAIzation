import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const appError = {
    message: err.message || 'Internal Server Error',
    statusCode: err.statusCode || 500,
  };

  logger.error(`[${req.method}] ${req.url} - ${appError.message}`, {
    method: req.method,
    url: req.url,
    stack: err.stack,
  });

  const response = {
    success: false,
    message: appError.message,
  };

  res.status(appError.statusCode).json(response);
}

export function asyncErrorHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}