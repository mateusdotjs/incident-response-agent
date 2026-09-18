export class DatabaseMetricPointDto {
  timestamp: Date;
  cpu: number;
  connections: number;
  queryLatency: number;
}

export class DatabaseMetricsResponseDto {
  database: string;
  points: DatabaseMetricPointDto[];
}
