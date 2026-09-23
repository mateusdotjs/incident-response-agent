import { Controller, Get, Param } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServiceResponseDto } from './dto/service-response.dto';
import { ServiceHealthResponseDto } from './dto/service-health-response.dto';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(): Promise<ServiceResponseDto[]> {
    return this.servicesService.findAll();
  }

  @Get(':serviceId')
  findByRef(@Param('serviceId') serviceId: string): Promise<ServiceResponseDto> {
    return this.servicesService.findByRef(serviceId);
  }

  @Get(':serviceId/health')
  getHealth(
    @Param('serviceId') serviceId: string,
  ): Promise<ServiceHealthResponseDto> {
    return this.servicesService.getHealth(serviceId);
  }
}
