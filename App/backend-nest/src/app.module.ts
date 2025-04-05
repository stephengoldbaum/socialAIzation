import { Module } from '@nestjs/common';
import { ConfigModule } from './config';
import { DatabaseModule } from './database/database.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { ScenariosModule } from './scenarios/scenarios.module';

@Module({
  imports: [
    // Core modules
    ConfigModule,
    DatabaseModule,
    
    // Feature modules
    UsersModule,
    AuthModule,
    ScenariosModule,
  ],
  controllers: [],
  providers: [
    // Global exception filter - implements fail-fast error handling
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global logging interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global roles guard for role-based access control
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
