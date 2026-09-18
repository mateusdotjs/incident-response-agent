import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { ServicesModule } from './services/services.module';
import { DeploymentsModule } from './deployments/deployments.module';
import { MetricsModule } from './metrics/metrics.module';
import { LogsModule } from './logs/logs.module';
import { DatabasesModule } from './databases/databases.module';
import { IncidentsModule } from './incidents/incidents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DrizzleModule,
    ServicesModule,
    DeploymentsModule,
    MetricsModule,
    LogsModule,
    DatabasesModule,
    IncidentsModule,
  ],
})
export class AppModule {}
