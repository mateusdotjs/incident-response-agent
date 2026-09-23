import { Controller, Get, Param, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { ListMetricsQueryDto } from './dto/list-metrics-query.dto';
import { MetricsResponseDto } from './dto/metrics-response.dto';

@Controller('services/:serviceId/metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  findByService(
    @Param('serviceId') serviceId: string,
    @Query() query: ListMetricsQueryDto,
  ): Promise<MetricsResponseDto> {
    return this.metricsService.findByService(serviceId, query);
  }
}
