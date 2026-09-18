export class LogResponseDto {
  id: string;
  serviceId: string;
  timestamp: Date;
  level: string;
  message: string;
  metadata: Record<string, unknown> | null;
}

export class ListLogsResponseDto {
  items: LogResponseDto[];
  total: number;
}
