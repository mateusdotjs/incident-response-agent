import { Controller, Get, Param, Query } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { ListDatabaseMetricsQueryDto } from './dto/list-database-metrics-query.dto';
import { DatabaseMetricsResponseDto } from './dto/database-metrics-response.dto';

@Controller('databases/:database/metrics')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @Get()
  findMetrics(
    @Param('database') database: string,
    @Query() query: ListDatabaseMetricsQueryDto,
  ): Promise<DatabaseMetricsResponseDto> {
    return this.databasesService.findMetrics(database, query);
  }
}
