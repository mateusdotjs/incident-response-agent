import { Controller, Get, Query } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto';
import { ListIncidentsResponseDto } from './dto/incident-response.dto';

@Controller('incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  find(
    @Query() query: ListIncidentsQueryDto,
  ): Promise<ListIncidentsResponseDto> {
    return this.incidentsService.find(query);
  }
}
