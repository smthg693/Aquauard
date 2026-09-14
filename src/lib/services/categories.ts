import { supabase, isSupabaseConfigured } from '../supabase';
import { INITIAL_CATEGORIES } from '../mockDataService';
import type { Category } from '../../types';

export async function fetchCategories(): Promise<Category[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description || '',
          isActive: item.is_active,
          createdAt: item.created_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching categories from Supabase, falling back:', e);
    }
  }
  return INITIAL_CATEGORIES;
}
