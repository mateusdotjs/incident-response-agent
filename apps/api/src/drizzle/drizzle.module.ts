import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createDatabase } from './drizzle-client';

export const DATABASE = Symbol('DATABASE');

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createDatabase(config.getOrThrow<string>('DATABASE_URL')),
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule {}
