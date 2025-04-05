import { Container } from 'inversify';
import 'reflect-metadata';
import { registerServices } from './services.module';

// Create and export the DI container without any options
const container = new Container();

// Register services using the function from services.module
registerServices(container);

export default container;
