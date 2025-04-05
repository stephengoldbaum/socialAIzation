import express from 'express';
import { createScenarioRoutes } from './scenario.routes';
import { ILoggerService } from '../services/logger.service';
import { authRoutes } from './auth.routes';
import container from '../di/container';

/**
 * Register all application routes
 * @param app Express application instance
 * @param logger Logger service
 */
export function registerRoutes(app: express.Application, logger: ILoggerService): void {
  // Create routes using the container
  const scenarioRouter = createScenarioRoutes(container);
  
  // API routes
  app.use('/api/scenarios', scenarioRouter);
  app.use('/api/auth', authRoutes());
  
  // Health check route
  app.get('/api/health', (req: express.Request, res: express.Response) => {
    (res as any).status(200).json({ 
      status: 'ok',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
  
  logger.info('Routes registered successfully');
}
