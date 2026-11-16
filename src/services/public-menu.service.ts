
import { supabase } from './supabase'
import type {
  Restaurant,
  Category,
  MenuItem,
} from '../types/database'

export interface PublicMenuData {
  restaurant: Restaurant
  categories: Category[]
  menuItems: MenuItem[]
}

export const publicMenuService = {
  async getBySlug(slug: string): Promise<PublicMenuData> {
    // 1. Get published restaurant
    const { data: restaurant, error: restaurantError } =
      await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single()

    if (restaurantError) throw restaurantError
    if (!restaurant) throw new Error('Restaurant not found.')

    // 2. Get active categories
    const { data: categories, error: categoryError } =
      await supabase
        .from('categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

    if (categoryError) throw categoryError

    // 3. Get available menu items
    const { data: menuItems, error: menuError } =
      await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('is_available', true)
        .order('sort_order', { ascending: true })

    if (menuError) throw menuError

    return {
      restaurant: restaurant as Restaurant,
      categories: (categories ?? []) as Category[],
      menuItems: (menuItems ?? []) as MenuItem[],
    }
  },
}
