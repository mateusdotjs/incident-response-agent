export class IncidentResponseDto {
  id: string;
  serviceId: string | null;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  startedAt: Date;
  resolvedAt: Date | null;
}

export class ListIncidentsResponseDto {
  items: IncidentResponseDto[];
}
