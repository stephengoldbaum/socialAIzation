import { Application, Request, Response } from 'express';
import { ILoggerService } from '../services/logger.service';

export function registerRoutes(app: Application, logger: ILoggerService): void {
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).send({ status: 'OK' });
  });
}