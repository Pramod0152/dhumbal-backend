import { Card } from './card.model';
import { Deck } from './deck';

export enum GamePhase {
  WAITING = 'WAITING',
  PLAYER_TURN_DISCARD = 'PLAYER_TURN_DISCARD',
  PLAYER_TURN_DRAW = 'PLAYER_TURN_DRAW',
  SHOWDOWN = 'SHOWDOWN',
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  totalPoints: number;
  turnCount: number;
}

export interface GameInstance {
  id: string; // Room ID
  players: Player[];
  phase: GamePhase;
  deck: Deck;
  discardPile: Card[][];
  activePlayerIndex: number;

}
