import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export const DEPLOYMENT_STATUSES = [
  'success',
  'failed',
  'rolled_back',
] as const;

export class ListDeploymentsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  environment?: string;

  @IsOptional()
  @IsIn(DEPLOYMENT_STATUSES)
  status?: (typeof DEPLOYMENT_STATUSES)[number];
}
