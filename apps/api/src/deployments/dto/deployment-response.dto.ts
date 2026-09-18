export class DeploymentResponseDto {
  id: string;
  serviceId: string;
  version: string;
  commitSha: string;
  environment: string;
  status: string;
  deployedAt: Date;
}

export class DeploymentDetailsResponseDto extends DeploymentResponseDto {
  changes: string[];
}

export class ListDeploymentsResponseDto {
  items: DeploymentResponseDto[];
}
