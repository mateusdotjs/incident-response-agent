import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { DeploymentsService } from './deployments.service';
import { ListDeploymentsQueryDto } from './dto/list-deployments-query.dto';
import {
  DeploymentDetailsResponseDto,
  ListDeploymentsResponseDto,
} from './dto/deployment-response.dto';

@Controller()
export class DeploymentsController {
  constructor(private readonly deploymentsService: DeploymentsService) {}

  @Get('services/:serviceId/deployments')
  findByService(
    @Param('serviceId') serviceId: string,
    @Query() query: ListDeploymentsQueryDto,
  ): Promise<ListDeploymentsResponseDto> {
    return this.deploymentsService.findByService(serviceId, query);
  }

  @Get('deployments/:deploymentId')
  findById(
    @Param('deploymentId', ParseUUIDPipe) deploymentId: string,
  ): Promise<DeploymentDetailsResponseDto> {
    return this.deploymentsService.findById(deploymentId);
  }
}
