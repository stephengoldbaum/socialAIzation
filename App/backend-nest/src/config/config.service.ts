import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * Configuration service that enforces strict fail-fast approach
 * - No default fallbacks are provided
 * - All configuration values must be explicitly set in environment variables
 * - Throws errors for missing values
 */
@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  /**
   * Get a required environment variable
   * @param key The environment variable key
   * @throws Error if the environment variable is not set
   */
  getRequired<T>(key: string): T {
    const value = this.configService.get<T>(key);
    
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is required but not provided`);
    }
    
    return value;
  }

  /**
   * Server configuration
   */
  get port(): number {
    return this.getRequired<number>('PORT');
  }

  get nodeEnv(): string {
    return this.getRequired<string>('NODE_ENV');
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * MongoDB configuration
   */
  get mongodbUri(): string {
    return this.getRequired<string>('MONGODB_URI');
  }

  /**
   * JWT configuration
   */
  get jwtSecret(): string {
    return this.getRequired<string>('JWT_SECRET');
  }

  get jwtRefreshSecret(): string {
    return this.getRequired<string>('JWT_REFRESH_SECRET');
  }

  get jwtExpiry(): string {
    return this.getRequired<string>('JWT_EXPIRY');
  }

  get jwtRefreshExpiry(): string {
    return this.getRequired<string>('JWT_REFRESH_EXPIRY');
  }

  /**
   * CORS configuration
   */
  get corsOrigin(): string {
    return this.getRequired<string>('CORS_ORIGIN');
  }

  /**
   * Logging configuration
   */
  get logLevel(): string {
    return this.getRequired<string>('LOG_LEVEL');
  }

  /**
   * Azure AD configuration (if used)
   */
  get azureAdConfig() {
    const authProvider = this.configService.get<string>('AUTH_PROVIDER');
    
    if (authProvider === 'azure') {
      return {
        tenantId: this.getRequired<string>('AZURE_AD_TENANT_ID'),
        clientId: this.getRequired<string>('AZURE_AD_CLIENT_ID'),
        clientSecret: this.getRequired<string>('AZURE_AD_CLIENT_SECRET'),
      };
    }
    
    return null;
  }
}
