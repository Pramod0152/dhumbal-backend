import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsIn,
  IsNotEmpty,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CardPayloadDto } from './card-payload.dto';

export class DrawCardsDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  roomId: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  playerId: string;

  @IsString()
  @IsIn(['pile', 'deck'])
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  drawFrom: string;

  @ValidateIf((dto: DrawCardsDto) => dto.drawFrom === 'pile')
  @IsDefined()
  @ValidateNested()
  @Type(() => CardPayloadDto)
  drawCard?: CardPayloadDto;
}
