export class ServiceResponseDto {
  id: string;
  name: string;
  description: string | null;
  team: string | null;
  repository: string | null;
  environment: string;
}
