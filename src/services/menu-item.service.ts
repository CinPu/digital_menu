
import { supabase } from './supabase'
import type { MenuItem } from '../types/database'

export interface MenuItemInput {
  category_id: string | null
  name_en: string
  name_my: string
  description_en: string
  description_my: string
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
}

export const menuItemService = {
  async getAll(restaurantId: string): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data ?? []) as MenuItem[]
  },

  async create(restaurantId: string, input: MenuItemInput) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert({
        restaurant_id: restaurantId,
        ...input,
      })
      .select()
      .single()

    if (error) throw error
    return data as MenuItem
  },

  async update(id: string, input: MenuItemInput) {
    const { data, error } = await supabase
      .from('menu_items')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as MenuItem
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
