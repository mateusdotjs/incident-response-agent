export type ServiceHealthStatus = 'healthy' | 'degraded' | 'down';

export class ServiceHealthResponseDto {
  serviceId: string;
  status: ServiceHealthStatus;
  errorRate: number;
  latencyP95: number;
}
