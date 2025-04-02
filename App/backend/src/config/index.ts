import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Environment determination
const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Helper function to get required environment variables
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value && isProduction) {
    throw new Error(`Environment variable ${key} is required in production mode`);
  }
  return value || '';
}

// Connection configurations
const config = {
  env: nodeEnv,
  isProduction,
  
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    cors: {
      origin: process.env.CORS_ORIGIN || (isProduction ? getRequiredEnv('CORS_ORIGIN') : 'http://localhost:3000'),
      credentials: true
    }
  },
  
  // MongoDB compatible configuration (works with any MongoDB-compatible database)
  mongodb: {
    connectionString: process.env.MONGODB_CONNECTION_STRING || (isProduction ? getRequiredEnv('MONGODB_CONNECTION_STRING') : 'mongodb://localhost:27017'),
    databaseName: process.env.MONGODB_DATABASE_NAME || 'metaverse-social',
    userCollection: process.env.MONGODB_USER_COLLECTION || 'users',
    scenarioCollection: process.env.MONGODB_SCENARIO_COLLECTION || 'scenarios',
    sessionCollection: process.env.MONGODB_SESSION_COLLECTION || 'sessions',
    interactionCollection: process.env.MONGODB_INTERACTION_COLLECTION || 'interactions'
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET || (isProduction ? getRequiredEnv('JWT_SECRET') : 'development-secret-do-not-use-in-production'),
    tokenExpiry: process.env.JWT_EXPIRY || '1d',
    azureAd: {
      clientId: process.env.AZURE_AD_CLIENT_ID || (isProduction ? getRequiredEnv('AZURE_AD_CLIENT_ID') : ''),
      tenantId: process.env.AZURE_AD_TENANT_ID || (isProduction ? getRequiredEnv('AZURE_AD_TENANT_ID') : ''),
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || (isProduction ? getRequiredEnv('AZURE_AD_CLIENT_SECRET') : ''),
      redirectUri: process.env.AZURE_AD_REDIRECT_URI || (isProduction ? getRequiredEnv('AZURE_AD_REDIRECT_URI') : '')
    }
  },
  
  // Platform-agnostic secrets management
  secrets: {
    provider: process.env.SECRETS_PROVIDER || 'env', // 'env', 'vault', 'aws', 'azure'
    
    // HashiCorp Vault configuration
    vault: {
      address: process.env.VAULT_ADDR || (isProduction && process.env.SECRETS_PROVIDER === 'vault' ? getRequiredEnv('VAULT_ADDR') : ''),
      token: process.env.VAULT_TOKEN || (isProduction && process.env.SECRETS_PROVIDER === 'vault' ? getRequiredEnv('VAULT_TOKEN') : ''),
      secretsPath: process.env.VAULT_SECRETS_PATH || 'metaverse-social'
    },
    
    // Azure Key Vault (backwards compatibility)
    azure: {
      name: process.env.KEY_VAULT_NAME || (isProduction && process.env.SECRETS_PROVIDER === 'azure' ? getRequiredEnv('KEY_VAULT_NAME') : ''),
      clientId: process.env.KEY_VAULT_CLIENT_ID || (isProduction && process.env.SECRETS_PROVIDER === 'azure' ? getRequiredEnv('KEY_VAULT_CLIENT_ID') : ''),
      clientSecret: process.env.KEY_VAULT_CLIENT_SECRET || (isProduction && process.env.SECRETS_PROVIDER === 'azure' ? getRequiredEnv('KEY_VAULT_CLIENT_SECRET') : ''),
      tenantId: process.env.KEY_VAULT_TENANT_ID || (isProduction && process.env.SECRETS_PROVIDER === 'azure' ? getRequiredEnv('KEY_VAULT_TENANT_ID') : '')
    }
  }
};

export default config;