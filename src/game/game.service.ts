import { Injectable } from '@nestjs/common';
import { HandValidatorService } from './logic/hand-validator.service';
import { GameInstance, GamePhase } from './logic/game.interface';
import { Deck } from './logic/deck';
import { Card } from './logic/card.model';

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
      currentThrown: [],
    };
    this.games.set(roomId, newGame);
    return newGame;
  }

  public joinGame(roomId: string, id: string, name = 'Player'): GameInstance {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }
    if (game.players.length >= 5) {
      throw new Error('Game is full');
    }
    if (game.players.some((player) => player.id === id)) {
      throw new Error('Player already joined');
    }

    game.players.push({
      id: id,
      name,
      hand: [],
      totalPoints: 0,
      turnCount: 0,
    });
    return game;
  }

  public startGame(roomId: string): GameInstance {
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
    return game;
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

  public discardCards(
    roomId: string,
    playerId: string,
    cards: Card[],
  ): GameInstance {
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

    game.currentThrown = cards;

    player.hand = player.hand.filter(
      (card) => !cards.some((c) => c.equals(card)),
    );
    game.discardPile.push(cards);
    game.phase = GamePhase.PLAYER_TURN_DRAW;
    this.games.set(roomId, game as GameInstance);
    return game;
  }

  public drawCards(
    roomId: string,
    playerId: string,
    drawFrom: string,
    drawCard?: Card,
  ): GameInstance {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }

    const player = game.players.find((player) => player.id === playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const card =
      drawFrom === 'pile'
        ? this.drawFromDiscardPile(roomId, drawCard)
        : game.deck.draw();

    if (drawCard) {
      game.discardPile.push([drawCard]);
    }

    player.hand.push(card);
    game.phase = GamePhase.PLAYER_TURN_DISCARD;
    game.activePlayerIndex = (game.activePlayerIndex + 1) % game.players.length;
    this.games.set(roomId, game as GameInstance);
    return game;
  }

  drawFromDiscardPile(roomId: string, drawCard?: Card): Card {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.discardPile.length === 0) {
      throw new Error('No cards to draw from discard pile');
    }
    if (!drawCard) {
      throw new Error('drawCard is required when drawing from pile');
    }

    const card = game.discardPile.find((pile) =>
      pile.some((c) => c.equals(drawCard)),
    );

    if (!card) {
      throw new Error('No cards to draw from discard pile');
    }

    return card[0];
  }

  public getGame(roomId: string): GameInstance {
    const game = this.games.get(roomId);
    if (!game) {
      throw new Error('Game not found');
    }
    return game;
  }
}
