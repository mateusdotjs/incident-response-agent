import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { DeploymentsController } from './deployments.controller';
import { DeploymentsService } from './deployments.service';
import { DeploymentsRepository } from './deployments.repository';

@Module({
  imports: [ServicesModule],
  controllers: [DeploymentsController],
  providers: [DeploymentsService, DeploymentsRepository],
})
export class DeploymentsModule {}
