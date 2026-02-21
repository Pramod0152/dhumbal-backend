import { Injectable } from '@nestjs/common';
import { Card, Suit } from './card.model';

@Injectable()
export class HandValidatorService {
  public validate(hand: Card[]): boolean {
    if (hand.length === 0) return false;
    if (hand.length === 1) return true;

    const sorted = [...hand].sort((a, b) => a.rank - b.rank);

    return this.isSet(sorted) || this.isStraight(sorted);
  }

  private isSet(hand: Card[]): boolean {
    return hand.every((c) => c.rank === hand[0].rank);
  }

  private isStraight(hand: Card[]): boolean {
    return (
      hand.every((c) => c.suit === hand[0].suit) && this.isConsecutive(hand)
    );
  }

  private isConsecutive(hand: Card[]): boolean {
    for (let i = 0; i < hand.length - 1; i++) {
      if (hand[i].rank + 1 !== hand[i + 1].rank) {
        return false;
      }
    }
    return true;
  }
}
