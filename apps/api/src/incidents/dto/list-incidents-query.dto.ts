import { IsIn, IsOptional, IsString } from 'class-validator';

export const INCIDENT_STATUSES = ['open', 'investigating', 'resolved'] as const;
export const INCIDENT_SEVERITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export class ListIncidentsQueryDto {
  @IsOptional()
  @IsIn(INCIDENT_STATUSES)
  status?: (typeof INCIDENT_STATUSES)[number];

  @IsOptional()
  @IsIn(INCIDENT_SEVERITIES)
  severity?: (typeof INCIDENT_SEVERITIES)[number];

  @IsOptional()
  @IsString()
  serviceId?: string;
}
