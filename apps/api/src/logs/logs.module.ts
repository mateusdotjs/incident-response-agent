import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { LogsController } from './logs.controller';
import { LogsService } from './logs.service';
import { LogsRepository } from './logs.repository';

@Module({
  imports: [ServicesModule],
  controllers: [LogsController],
  providers: [LogsService, LogsRepository],
})
export class LogsModule {}
