import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Scenario, ScenarioSchema } from './schemas/scenario.schema';
import { ScenariosService } from './scenarios.service';
import { ScenariosController } from './scenarios.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Scenario.name, schema: ScenarioSchema },
    ]),
  ],
  controllers: [ScenariosController],
  providers: [ScenariosService],
  exports: [ScenariosService],
})
export class ScenariosModule {}
