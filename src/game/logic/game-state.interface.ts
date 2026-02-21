import { Card } from './card.model';

export enum GamePhase {
  WAITING = 'WAITING',
  PLAYER_TURN_DISCARD = 'PLAYER_TURN_DISCARD',
  PLAYER_TURN_DRAW = 'PLAYER_TURN_DRAW',
  SHOWDOWN = 'SHOWDOWN',
}

export interface GameState {
  id: string;
  name: string;
  hand: Card[];
  totalPoints: number;
  turnCount: number;
}
