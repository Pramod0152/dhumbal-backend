import { Type } from 'class-transformer';
import { IsEnum, IsInt, Max, Min } from 'class-validator';
import { Suit } from '../logic/card.model';

export class CardPayloadDto {
  @IsEnum(Suit)
  suit: Suit;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(13)
  rank: number;
}
