import { supabase, setCurrentMember } from './supabase';
import { UserSession, ScratchResult, Sticker } from '../types/database';
import { Database } from '../types/supabase';

type MemberRow = Database['public']['Tables']['members']['Row'];
type StickerRow = Database['public']['Tables']['stickers']['Row'];
type CollectionRow = Database['public']['Tables']['member_collections']['Row'];
type DonorRow = Database['public']['Tables']['donors']['Row'];

export class DatabaseService {
  // Authentication
  static async login(username: string, password: string): Promise<UserSession | null> {
    try {
      console.log('Attempting login for:', username);
      console.log('Supabase client initialized:', !!supabase);
      
      const { data: member, error } = await supabase
        .from('members')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single();

      console.log('Login response:', { member, error });

      if (error || !member) {
        console.log('Login failed:', error);
        return null;
      }

      // Set current member for RLS
      await setCurrentMember(member.member_id);

      // Get collected stickers
      const { data: collections } = await supabase
        .from('member_collections')
        .select('sticker_id')
        .eq('member_id', member.member_id);

      // Get last scratch time
      const { data: lastScratch } = await supabase
        .from('scratch_records')
        .select('date_scratched')
        .eq('member_id', member.member_id)
        .order('date_scratched', { ascending: false })
        .limit(1)
        .single();

      return {
        memberId: member.member_id,
        name: member.name,
        username: member.username,
        lastScratchTime: lastScratch?.date_scratched ? new Date(lastScratch.date_scratched) : null,
        collectedStickers: collections?.map(c => c.sticker_id) || [],
        isAdmin: member.is_admin,
      };
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // Get member's collected stickers
  static async getCollectedStickers(memberId: string): Promise<string[]> {
    try {
      await setCurrentMember(memberId);
      
      const { data: collections, error } = await supabase
        .from('member_collections')
        .select('sticker_id')
        .eq('member_id', memberId);

      if (error) {
        console.error('Error fetching collections:', error);
        return [];
      }

      return collections?.map(c => c.sticker_id) || [];
    } catch (error) {
      console.error('Error getting collected stickers:', error);
      return [];
    }
  }

  // Check if member can scratch today
  static async canScratchToday(memberId: string): Promise<boolean> {
    try {
      await setCurrentMember(memberId);
      
      const { data: lastScratch } = await supabase
        .from('scratch_records')
        .select('date_scratched')
        .eq('member_id', memberId)
        .order('date_scratched', { ascending: false })
        .limit(1)
        .single();

      if (!lastScratch) {
        return true;
      }

      const now = new Date();
      const lastScratchDate = new Date(lastScratch.date_scratched);
      const timeDiff = now.getTime() - lastScratchDate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      return hoursDiff >= 24;
    } catch (error) {
      console.error('Error checking scratch availability:', error);
      return true;
    }
  }

  // Get time until next scratch
  static async getTimeUntilNextScratch(memberId: string): Promise<number> {
    try {
      await setCurrentMember(memberId);
      
      const { data: lastScratch } = await supabase
        .from('scratch_records')
        .select('date_scratched')
        .eq('member_id', memberId)
        .order('date_scratched', { ascending: false })
        .limit(1)
        .single();

      if (!lastScratch) {
        return 0;
      }

      const now = new Date();
      const lastScratchDate = new Date(lastScratch.date_scratched);
      const nextScratchTime = new Date(lastScratchDate.getTime() + (24 * 60 * 60 * 1000));
      const timeRemaining = Math.max(0, nextScratchTime.getTime() - now.getTime());
      
      return timeRemaining;
    } catch (error) {
      console.error('Error calculating time until next scratch:', error);
      return 0;
    }
  }

  // Execute scratch and record result
  static async executeScratch(memberId: string, isPaidScratch: boolean = false): Promise<ScratchResult> {
    try {
      await setCurrentMember(memberId);
      
      // Get available stickers
      const { data: stickers } = await supabase
        .from('stickers')
        .select('*')
        .gt('availability', 0)
        .lte('activation_date', new Date().toISOString().split('T')[0]);

      if (!stickers || stickers.length === 0) {
        return {
          success: false,
          message: 'No stickers available at this time',
          betterLuckNextTime: true,
          probability: 0
        };
      }

      // Get member's collected stickers to avoid duplicates
      const collectedStickers = await this.getCollectedStickers(memberId);

      // Build probability pool
      const pool: StickerRow[] = [];
      stickers.forEach(sticker => {
        // Skip if already collected (except for Orion which is unique)
        if (sticker.type !== 'Orion' && collectedStickers.includes(sticker.sticker_id)) {
          return;
        }

        // Skip Orion if not available yet
        if (sticker.type === 'Orion') {
          const today = new Date();
          const availableFrom = new Date('2024-08-20');
          if (today < availableFrom) {
            return;
          }
        }

        // Add to pool based on probability
        const weight = Math.floor(sticker.probability * 10);
        for (let i = 0; i < weight; i++) {
          pool.push(sticker);
        }
      });

      // 30% chance of getting "Better luck next time"
      const shouldGetSticker = Math.random() > 0.3;
      
      if (!shouldGetSticker || pool.length === 0) {
        // Record unsuccessful scratch
        await supabase
          .from('scratch_records')
          .insert({
            member_id: memberId,
            sticker_id: null,
            is_paid_scratch: isPaidScratch,
            success: false
          });

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

      // Update sticker availability
      await supabase
        .from('stickers')
        .update({ availability: selectedSticker.availability - 1 })
        .eq('sticker_id', selectedSticker.sticker_id);

      // Record successful scratch
      await supabase
        .from('scratch_records')
        .insert({
          member_id: memberId,
          sticker_id: selectedSticker.sticker_id,
          is_paid_scratch: isPaidScratch,
          success: true
        });

      // Add to member's collection
      await supabase
        .from('member_collections')
        .insert({
          member_id: memberId,
          sticker_id: selectedSticker.sticker_id
        });

      const isSpecialPrize = selectedSticker.type === 'Orion';

      return {
        success: true,
        sticker: {
          sticker_id: selectedSticker.sticker_id,
          name: selectedSticker.name,
          type: selectedSticker.type,
          probability: selectedSticker.probability,
          availability: selectedSticker.availability - 1,
          activation_date: new Date(selectedSticker.activation_date)
        },
        message: isSpecialPrize 
          ? '🎉 Congratulations! You won the Mystery Box - Orion Bappa! 🎉'
          : `You received: ${selectedSticker.name}`,
        isSpecialPrize,
        probability: selectedSticker.probability
      };
    } catch (error) {
      console.error('Error executing scratch:', error);
      return {
        success: false,
        message: 'An error occurred while scratching',
        betterLuckNextTime: true,
        probability: 0
      };
    }
  }

  // Get leaderboard data
  static async getLeaderboard(): Promise<any[]> {
    try {
      const { data: leaderboard, error } = await supabase
        .from('member_collections')
        .select(`
          member_id,
          members!inner(name, username),
          sticker_id
        `)
        .order('collected_at', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      // Group by member and count stickers
      const memberStats = leaderboard?.reduce((acc: any, item: any) => {
        const memberId = item.member_id;
        if (!acc[memberId]) {
          acc[memberId] = {
            id: memberId,
            name: item.members.name,
            username: item.members.username,
            stickers: 0,
            rank: 0
          };
        }
        acc[memberId].stickers += 1;
        return acc;
      }, {});

      // Convert to array and sort by sticker count
      const sortedMembers = Object.values(memberStats || {})
        .sort((a: any, b: any) => b.stickers - a.stickers)
        .map((member: any, index: number) => ({
          ...member,
          rank: index + 1
        }));

      return sortedMembers;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Get donors
  static async getDonors(): Promise<DonorRow[]> {
    try {
      const { data: donors, error } = await supabase
        .from('donors')
        .select('*')
        .order('amount', { ascending: false });

      if (error) {
        console.error('Error fetching donors:', error);
        return [];
      }

      return donors || [];
    } catch (error) {
      console.error('Error getting donors:', error);
      return [];
    }
  }

  // Admin functions
  static async getAllMembers(): Promise<MemberRow[]> {
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        return [];
      }

      return members || [];
    } catch (error) {
      console.error('Error getting all members:', error);
      return [];
    }
  }

  static async assignPaidScratch(memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('members')
        .update({ paid_scratch_available: true })
        .eq('member_id', memberId);

      return !error;
    } catch (error) {
      console.error('Error assigning paid scratch:', error);
      return false;
    }
  }

  static async revokePaidScratch(memberId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('members')
        .update({ paid_scratch_available: false })
        .eq('member_id', memberId);

      return !error;
    } catch (error) {
      console.error('Error revoking paid scratch:', error);
      return false;
    }
  }

  // Get inventory stats
  static async getInventoryStats(): Promise<any> {
    try {
      const { data: stickers } = await supabase
        .from('stickers')
        .select('availability');

      const { data: scratchRecords } = await supabase
        .from('scratch_records')
        .select('is_paid_scratch');

      const { data: paidMembers } = await supabase
        .from('members')
        .select('paid_scratch_available')
        .eq('paid_scratch_available', true);

      const totalCards = stickers?.reduce((sum, s) => sum + s.availability, 0) || 0;
      const usedCards = scratchRecords?.length || 0;
      const paidCards = paidMembers?.length || 0;

      return {
        totalCards: totalCards + usedCards,
        usedCards,
        remainingCards: totalCards,
        paidCards
      };
    } catch (error) {
      console.error('Error getting inventory stats:', error);
      return {
        totalCards: 0,
        usedCards: 0,
        remainingCards: 0,
        paidCards: 0
      };
    }
  }
}