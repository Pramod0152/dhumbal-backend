export enum Suit {
  SPADES = 'S',
  HEARTS = 'H',
  DIAMONDS = 'D',
  CLUBS = 'C',
}

export class Card {
  constructor(
    public readonly suit: Suit,
    public readonly rank: number,
  ) {}

  get pointValue(): number {
    return this.rank > 10 ? 10 : this.rank;
  }

  get display(): string {
    const ranks = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
    return `${ranks[this.rank] ?? this.rank} of ${this.suit}`;
  }
}
