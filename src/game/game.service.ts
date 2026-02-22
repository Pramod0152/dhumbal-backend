import { Injectable } from '@nestjs/common';
import { HandValidatorService } from './logic/hand-validator.service';
import { GameInstance, GamePhase } from './logic/game.interface';
import { Deck } from './logic/deck';
import { Card, Suit } from './logic/card.model';

@Injectable()
export class GameService {
  private readonly games: Map<string, GameInstance> = new Map();
  constructor(private readonly validator: HandValidatorService) {}

  public createGame(roomId: string): GameInstance {
    const newGame: GameInstance = {
      id: roomId,
      players: [],
      phase: GamePhase.WAITING,
      deck: new Deck(),
      discardPile: [],
      activePlayerIndex: 0,
    };
    this.games.set(roomId, newGame);
    return newGame;
  }

  public joinGame(roomId: string, id: string): GameInstance {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }
    if (game.players.length >= 5) {
      throw new Error('Game is full');
    }
    game.players.push({
      id: id,
      name: 'Player 1',
      hand: [],
      totalPoints: 0,
      turnCount: 0,
    });
    return game;
  }

  public startGame(roomId: string): void {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }
    if (game.players.length < 2) {
      throw new Error('Not enough players to start game');
    }
    game.deck.reset();
    game.deck.shuffle();
    this.dealCardsToPlayers(roomId);
    game.phase = GamePhase.PLAYER_TURN_DISCARD;
    game.activePlayerIndex = 0;
  }

  public dealCardsToPlayers(roomId: string): void {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }
    for (let i = 0; i < 5; i++) {
      for (const player of game.players) {
        const card = game.deck.draw();
        if (!card) {
          throw new Error('Not enough cards to deal');
        }

        player.hand.push(card);
      }
    }
  }

  public discardCards(roomId: string, playerId: string, cards: Card[]): void {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }

    const player = game.players.find((player) => player.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const isValidated = this.validator.validate(cards);
    if (!isValidated) {
      throw new Error('Invalid cards discarded');
    }

    player.hand = player.hand.filter(
      (card) => !cards.some((c) => c.equals(card)),
    );
    game.discardPile.push(cards);
    game.phase = GamePhase.PLAYER_TURN_DRAW;
    this.games.set(roomId, game as GameInstance);
  }
}
