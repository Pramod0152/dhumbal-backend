import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { EventType } from 'src/common/enum';
import { Server, Socket } from 'socket.io';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinGameDto } from './dto/join-game.dto';
import { StartGameDto } from './dto/start-game.dto';
import { DiscardCardsDto } from './dto/discard-cards.dto';
import { DrawCardsDto } from './dto/draw-cards.dto';
import { Card, Suit } from './logic/card.model';
import { GameInstance } from './logic/game.interface';
import { CardPayloadDto } from './dto/card-payload.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class Gateway {
  private static readonly GAME_EVENTS_CHANNEL = 'on-game-events';

  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage('game:create')
  handleCreateGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: CreateGameDto,
  ): void {
    const game = this.gameService.createGame(body.roomId);
    client.join(game.id);
    this.emitGameEvent(game.id, EventType.GAME_CREATED, game);
  }
 
  // join game
  @SubscribeMessage('game:join')
  handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinGameDto,
  ): void {
    const game = this.gameService.joinGame(
      body.roomId,
      body.playerId,
      body.name || 'Player',
    );
    client.join(game.id);
    this.emitGameEvent(game.id, EventType.GAME_JOINED, game);
  }

  @SubscribeMessage('game:start')
  handleStartGame(@MessageBody() body: StartGameDto): void {
    const game = this.gameService.startGame(body.roomId);
    this.emitGameEvent(game.id, EventType.GAME_STARTED, game);
  }

  @SubscribeMessage('game:discard')
  handleDiscardCards(@MessageBody() body: DiscardCardsDto): void {
    const cards = body.cards.map((card) => this.toCard(card));
    const game = this.gameService.discardCards(
      body.roomId,
      body.playerId,
      cards,
    );
    this.emitGameEvent(game.id, EventType.CARDS_DISCARDED, game);
  }

  @SubscribeMessage('game:draw')
  handleDrawCards(@MessageBody() body: DrawCardsDto): void {
    const drawCard = body.drawCard ? this.toCard(body.drawCard) : undefined;
    const game = this.gameService.drawCards(
      body.roomId,
      body.playerId,
      body.drawFrom,
      drawCard,
    );
    this.emitGameEvent(game.id, EventType.CARDS_DRAWN, game);
  }

  @SubscribeMessage('game:get-state')
  handleGetGameState(@MessageBody() body: StartGameDto): void {
    const game = this.gameService.getGame(body.roomId);
    this.emitGameEvent(game.id, EventType.GAME_STATE, game);
  }

  private emitGameEvent(
    roomId: string,
    type: EventType,
    payload: GameInstance,
  ): void {
    this.server.to(roomId).emit(Gateway.GAME_EVENTS_CHANNEL, {
      type,
      roomId,
      payload,
    });
  }

  private toCard(card: CardPayloadDto): Card {
    return new Card(card.suit as Suit, card.rank);
  }
}
