export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          member_id: string;
          name: string;
          username: string;
          password: string;
          is_admin: boolean;
          paid_scratch_available: boolean;
          created_at: string;
        };
        Insert: {
          member_id?: string;
          name: string;
          username: string;
          password: string;
          is_admin?: boolean;
          paid_scratch_available?: boolean;
          created_at?: string;
        };
        Update: {
          member_id?: string;
          name?: string;
          username?: string;
          password?: string;
          is_admin?: boolean;
          paid_scratch_available?: boolean;
          created_at?: string;
        };
      };
      stickers: {
        Row: {
          sticker_id: string;
          name: string;
          type: 'Common' | 'Rare' | 'Very Rare' | 'Orion';
          probability: number;
          availability: number;
          activation_date: string;
        };
        Insert: {
          sticker_id: string;
          name: string;
          type: 'Common' | 'Rare' | 'Very Rare' | 'Orion';
          probability: number;
          availability?: number;
          activation_date?: string;
        };
        Update: {
          sticker_id?: string;
          name?: string;
          type?: 'Common' | 'Rare' | 'Very Rare' | 'Orion';
          probability?: number;
          availability?: number;
          activation_date?: string;
        };
      };
      scratch_records: {
        Row: {
          scratch_id: string;
          member_id: string;
          sticker_id: string | null;
          date_scratched: string;
          is_paid_scratch: boolean;
          success: boolean;
        };
        Insert: {
          scratch_id?: string;
          member_id: string;
          sticker_id?: string | null;
          date_scratched?: string;
          is_paid_scratch?: boolean;
          success: boolean;
        };
        Update: {
          scratch_id?: string;
          member_id?: string;
          sticker_id?: string | null;
          date_scratched?: string;
          is_paid_scratch?: boolean;
          success?: boolean;
        };
      };
      member_collections: {
        Row: {
          collection_id: string;
          member_id: string;
          sticker_id: string;
          collected_at: string;
        };
        Insert: {
          collection_id?: string;
          member_id: string;
          sticker_id: string;
          collected_at?: string;
        };
        Update: {
          collection_id?: string;
          member_id?: string;
          sticker_id?: string;
          collected_at?: string;
        };
      };
      donors: {
        Row: {
          donor_id: string;
          name: string;
          amount: number;
          date: string;
        };
        Insert: {
          donor_id?: string;
          name: string;
          amount: number;
          date?: string;
        };
        Update: {
          donor_id?: string;
          name?: string;
          amount?: number;
          date?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      set_config: {
        Args: {
          setting_name: string;
          setting_value: string;
          is_local: boolean;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}