import { Module } from '@nestjs/common';
import { Card } from './game/logic/card.model';

@Module({
  imports: [],
  controllers: [],
  providers: [Card],
  exports: [Card],
})
export class AppModule {}
