
export interface Restaurant {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  currency: string
  is_published: boolean
  created_at: string
}

export interface Category {
  id: string
  restaurant_id: string
  name_en: string
  name_my: string
  sort_order: number
  is_active: boolean
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string | null
  name_en: string
  name_my: string
  description_en: string | null
  description_my: string | null
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
}

export interface Category {
  id: string
  restaurant_id: string
  name_en: string
  name_my: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string | null
  name_en: string
  name_my: string
  description_en: string | null
  description_my: string | null
  price: number
  image_url: string | null
  is_available: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

