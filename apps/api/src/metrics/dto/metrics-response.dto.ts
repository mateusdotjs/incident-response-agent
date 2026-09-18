export class MetricPointDto {
  timestamp: Date;
  value: number;
}

export class MetricsResponseDto {
  serviceId: string;
  metric: string;
  points: MetricPointDto[];
}
