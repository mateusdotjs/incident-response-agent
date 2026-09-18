import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import { ServiceResponseDto } from './dto/service-response.dto';
import {
  ServiceHealthResponseDto,
  ServiceHealthStatus,
} from './dto/service-health-response.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly repository: ServicesRepository) {}

  async findAll(): Promise<ServiceResponseDto[]> {
    const rows = await this.repository.findAll();

    return rows.map((row) => this.toResponse(row));
  }

  async findById(serviceId: string): Promise<ServiceResponseDto> {
    const service = await this.repository.findById(serviceId);

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    return this.toResponse(service);
  }

  async getHealth(serviceId: string): Promise<ServiceHealthResponseDto> {
    const service = await this.repository.findById(serviceId);

    if (!service) {
      throw new NotFoundException(`Service ${serviceId} not found`);
    }

    const [errorRate, latencyP95] = await Promise.all([
      this.repository.findLatestMetricValue(serviceId, 'error_rate'),
      this.repository.findLatestMetricValue(serviceId, 'latency_p95'),
    ]);

    return {
      serviceId,
      status: this.resolveStatus(errorRate ?? 0, latencyP95 ?? 0),
      errorRate: errorRate ?? 0,
      latencyP95: latencyP95 ?? 0,
    };
  }

  private resolveStatus(
    errorRate: number,
    latencyP95: number,
  ): ServiceHealthStatus {
    if (errorRate >= 50) {
      return 'down';
    }

    if (errorRate >= 1 || latencyP95 >= 1000) {
      return 'degraded';
    }

    return 'healthy';
  }

  private toResponse(service: {
    id: string;
    name: string;
    description: string | null;
    team: string | null;
    repository: string | null;
    environment: string;
  }): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      team: service.team,
      repository: service.repository,
      environment: service.environment,
    };
  }
}
