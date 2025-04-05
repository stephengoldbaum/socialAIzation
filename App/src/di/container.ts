import { Container, ContainerOptions } from 'inversify';

const container = new Container({
  defaultScope: "Singleton",
  autoBindInjectable: true
} as ContainerOptions);

export default container;