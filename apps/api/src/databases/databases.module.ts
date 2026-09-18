import { Module } from '@nestjs/common';
import { DatabasesController } from './databases.controller';
import { DatabasesService } from './databases.service';
import { DatabasesRepository } from './databases.repository';

@Module({
  controllers: [DatabasesController],
  providers: [DatabasesService, DatabasesRepository],
})
export class DatabasesModule {}
