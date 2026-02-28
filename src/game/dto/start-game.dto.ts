import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartGameDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  roomId: string;
}
