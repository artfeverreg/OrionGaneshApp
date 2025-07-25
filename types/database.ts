export interface Member {
  member_id: string;
  name: string;
  username: string;
  password: string;
  collected_stickers: string[];
  paid_scratch_available: boolean;
  created_at: Date;
}

export interface Sticker {
  sticker_id: string;
  name: string;
  type: 'Common' | 'Rare' | 'Very Rare' | 'Orion';
  probability: number;
  availability: number;
  activation_date: Date;
}

export interface ScratchRecord {
  scratch_id: string;
  member_id: string;
  sticker_id: string;
  date_scratched: Date;
  is_paid_scratch: boolean;
}

export interface Donor {
  donor_id: string;
  name: string;
  amount: number;
  date: Date;
}

export interface Admin {
  admin_id: string;
  username: string;
  password: string;
}

export interface ScratchResult {
  success: boolean;
  sticker?: Sticker;
  message: string;
  isSpecialPrize?: boolean;
}