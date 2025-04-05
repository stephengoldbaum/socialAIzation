import * as Joi from 'joi';

/**
 * Validation schema for environment variables
 * Enforces strict fail-fast configuration approach:
 * - No default values are provided
 * - All required environment variables must be explicitly set
 * - Validation fails if any required variable is missing
 */
export const configValidationSchema = Joi.object({
  // Server Configuration
  PORT: Joi.number().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),

  // MongoDB Configuration
  MONGODB_URI: Joi.string().required(),

  // JWT Authentication
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_EXPIRY: Joi.string().required(),
  JWT_REFRESH_EXPIRY: Joi.string().required(),

  // CORS Configuration
  CORS_ORIGIN: Joi.string().required(),

  // Logging
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .required(),

  // Azure AD Configuration (optional based on auth provider)
  AZURE_AD_TENANT_ID: Joi.string().when('AUTH_PROVIDER', {
    is: 'azure',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AZURE_AD_CLIENT_ID: Joi.string().when('AUTH_PROVIDER', {
    is: 'azure',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AZURE_AD_CLIENT_SECRET: Joi.string().when('AUTH_PROVIDER', {
    is: 'azure',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),

  // Optional auth provider configuration
  AUTH_PROVIDER: Joi.string().valid('local', 'azure').default('local'),
});
