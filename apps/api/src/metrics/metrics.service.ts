import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from '../services/services.repository';
import { MetricsRepository } from './metrics.repository';
import { ListMetricsQueryDto } from './dto/list-metrics-query.dto';
import { MetricsResponseDto } from './dto/metrics-response.dto';

@Injectable()
export class MetricsService {
  constructor(
    private readonly repository: MetricsRepository,
    private readonly servicesRepository: ServicesRepository,
  ) {}

  async findByService(
    serviceId: string,
    query: ListMetricsQueryDto,
  ): Promise<MetricsResponseDto> {
    const service = await this.servicesRepository.findById(serviceId);

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    const points = await this.repository.findPoints({
      serviceId,
      metric: query.metric,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });

    return {
      serviceId,
      metric: query.metric,
      points: points.map((point) => ({
        timestamp: point.timestamp,
        value: point.value,
      })),
    };
  }
}
