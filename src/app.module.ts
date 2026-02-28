import { Module } from '@nestjs/common';
import { Card } from './game/logic/card.model';
import { GameService } from './game/game.service';
import { HandValidatorService } from './game/logic/hand-validator.service';
import { Deck } from './game/logic/deck';
import { Gateway } from './game/gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [Card, GameService, HandValidatorService, Deck, Gateway],
  exports: [Card, GameService, HandValidatorService, Deck, Gateway],
})
export class AppModule {}
