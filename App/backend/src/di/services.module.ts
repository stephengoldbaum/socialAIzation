import { Container } from 'inversify';
import TYPES from './types';
import { ScenarioService } from '../services/scenario.service';

/**
 * Register services with the container
 * @param container The inversify container
 */
export function registerServices(container: Container): void {
  // Register ScenarioService
  container.bind<ScenarioService>(TYPES.ScenarioService).to(ScenarioService).inSingletonScope();
  
  // Add other service registrations here
}
