import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '../config';
import { MongoError } from 'mongodb';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.mongodbUri,
        // Fail fast on connection errors
        connectionFactory: (connection) => {
          connection.on('error', (err: MongoError) => {
            console.error('MongoDB connection error:', err);
            process.exit(1);
          });
          
          connection.on('disconnected', () => {
            console.error('MongoDB disconnected. Shutting down application.');
            process.exit(1);
          });
          
          return connection;
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
