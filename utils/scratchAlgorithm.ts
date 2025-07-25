import { Sticker, ScratchResult } from '../types/database';

export class ScratchCardAlgorithm {
  private stickers: Sticker[];

  constructor(stickers: Sticker[]) {
    this.stickers = stickers;
  }

  private isOrionBappaAvailable(): boolean {
    const today = new Date();
    const availableFrom = new Date('2024-08-20');
    return today >= availableFrom;
  }

  private buildProbabilityPool(): Sticker[] {
    const pool: Sticker[] = [];
    const today = new Date();

    this.stickers.forEach(sticker => {
      // Skip Orion Bappa if not available yet
      if (sticker.type === 'Orion' && !this.isOrionBappaAvailable()) {
        return;
      }

      // Skip if no availability left
      if (sticker.availability <= 0) {
        return;
      }

      // Skip if not activated yet
      if (sticker.activation_date > today) {
        return;
      }

      // Add to pool based on probability (multiply by 10 for weight scaling)
      const weight = Math.floor(sticker.probability * 10);
      for (let i = 0; i < weight; i++) {
        pool.push(sticker);
      }
    });

    return pool;
  }

  public executeScatch(memberCollectedStickers: string[] = []): ScratchResult {
    const pool = this.buildProbabilityPool();

    if (pool.length === 0) {
      return {
        success: false,
        message: 'No stickers available at this time',
        betterLuckNextTime: true,
        probability: 0
      };
    }

    // 30% chance of getting "Better luck next time"
    const shouldGetSticker = Math.random() > 0.3;
    
    if (!shouldGetSticker) {
      return {
        success: false,
        message: 'Better luck next time! 🍀',
        betterLuckNextTime: true,
        probability: 30
      };
    }

    // Randomly select from weighted pool
    const randomIndex = Math.floor(Math.random() * pool.length);
    const selectedSticker = pool[randomIndex];

    // Check availability one more time
    if (selectedSticker.availability <= 0) {
      // Remove from pool and try again
      return this.executeScatch(memberCollectedStickers);
    }

    // Reduce availability (this would be handled in database)
    selectedSticker.availability -= 1;

    const isSpecialPrize = selectedSticker.type === 'Orion';

    return {
      success: true,
      sticker: selectedSticker,
      message: isSpecialPrize 
        ? '🎉 Congratulations! You won the Mystery Box - Orion Bappa! 🎉'
        : `You received: ${selectedSticker.name}`,
      isSpecialPrize,
      probability: selectedSticker.probability
    };
  }

  public static getDefaultStickers(): Sticker[] {
    return [
      {
        sticker_id: '1',
        name: 'Mayureshwar',
        type: 'Common',
        probability: 20,
        availability: 100,
        activation_date: new Date('2024-08-01')
      },
      {
        sticker_id: '2',
        name: 'Siddhivinayak',
        type: 'Common',
        probability: 20,
        availability: 100,
        activation_date: new Date('2024-08-01')
      },
      {
        sticker_id: '3',
        name: 'Ballaleshwar',
        type: 'Common',
        probability: 20,
        availability: 100,
        activation_date: new Date('2024-08-01')
      },
      {
        sticker_id: '4',
        name: 'Varadavinayak',
        type: 'Rare',
        probability: 7,
        availability: 50,
        activation_date: new Date('2024-08-01')
      },
      {
        sticker_id: '5',
        name: 'Chintamani',
        type: 'Rare',
        probability: 7,
        availability: 50,
        activation_date: new Date('2024-08-01')
      },
      {
        sticker_id: '6',
        name: 'Girijatmaj',
        type: 'Very Rare',
        probability: 3,
        availability: 20,
        activation_date: new Date('2024-08-10')
      },
      {
        sticker_id: '7',
        name: 'Vighnahar',
        type: 'Very Rare',
        probability: 2,
        availability: 15,
        activation_date: new Date('2024-08-15')
      },
      {
        sticker_id: '8',
        name: 'Mahaganapati',
        type: 'Very Rare',
        probability: 1,
        availability: 10,
        activation_date: new Date('2024-08-18')
      },
      {
        sticker_id: '9',
        name: 'Orion Bappa',
        type: 'Orion',
        probability: 0.5,
        availability: 1,
        activation_date: new Date('2024-08-20')
      }
    ];
  }
}