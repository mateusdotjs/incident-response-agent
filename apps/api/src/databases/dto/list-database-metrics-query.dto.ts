import { IsDateString, IsOptional } from 'class-validator';

export class ListDatabaseMetricsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
