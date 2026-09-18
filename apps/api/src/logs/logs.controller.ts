import { Controller, Get, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { ListLogsQueryDto } from './dto/list-logs-query.dto';
import { ListLogsResponseDto } from './dto/log-response.dto';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  find(@Query() query: ListLogsQueryDto): Promise<ListLogsResponseDto> {
    return this.logsService.find(query);
  }
}
