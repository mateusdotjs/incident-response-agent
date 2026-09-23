import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from '../services/services.repository';
import { DeploymentsRepository } from './deployments.repository';
import { ListDeploymentsQueryDto } from './dto/list-deployments-query.dto';
import {
  DeploymentDetailsResponseDto,
  DeploymentResponseDto,
  ListDeploymentsResponseDto,
} from './dto/deployment-response.dto';

type DeploymentRow = {
  id: string;
  serviceId: string;
  version: string;
  commitSha: string;
  environment: string;
  status: string;
  deployedAt: Date;
  changes: string[];
};

@Injectable()
export class DeploymentsService {
  constructor(
    private readonly repository: DeploymentsRepository,
    private readonly servicesRepository: ServicesRepository,
  ) {}

  async findByService(
    serviceId: string,
    query: ListDeploymentsQueryDto,
  ): Promise<ListDeploymentsResponseDto> {
    const service = await this.servicesRepository.findByRef(serviceId);

    if (!service) {
      throw new NotFoundException(`Service "${serviceId}" not found`);
    }

    const rows = await this.repository.findByService({
      serviceId: service.id,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      environment: query.environment,
      status: query.status,
    });

    return { items: rows.map((row) => this.toResponse(row)) };
  }

  async findById(deploymentId: string): Promise<DeploymentDetailsResponseDto> {
    const deployment = await this.repository.findById(deploymentId);

    if (!deployment) {
      throw new NotFoundException(`Deployment ${deploymentId} not found`);
    }

    return {
      ...this.toResponse(deployment),
      changes: deployment.changes,
    };
  }

  private toResponse(deployment: DeploymentRow): DeploymentResponseDto {
    return {
      id: deployment.id,
      serviceId: deployment.serviceId,
      version: deployment.version,
      commitSha: deployment.commitSha,
      environment: deployment.environment,
      status: deployment.status,
      deployedAt: deployment.deployedAt,
    };
  }
}
