import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { MetricsRepository } from './metrics.repository';

@Module({
  imports: [ServicesModule],
  controllers: [MetricsController],
  providers: [MetricsService, MetricsRepository],
})
export class MetricsModule {}
