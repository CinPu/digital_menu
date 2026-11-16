
import { supabase } from './supabase'
import type { Category } from '../types/database'

export interface CategoryInput {
  name_en: string
  name_my: string
  sort_order: number
  is_active: boolean
}

export const categoryService = {
  async getAll(restaurantId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data ?? []) as Category[]
  },

  async create(restaurantId: string, input: CategoryInput) {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        restaurant_id: restaurantId,
        ...input,
      })
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async update(id: string, input: CategoryInput) {
    const { data, error } = await supabase
      .from('categories')
      .update(input)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Category
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}
