
import { supabase } from './supabase'

const BUCKET = 'menu-images'

export const storageService = {
  async uploadMenuImage(file: File, restaurantId: string) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPG, PNG and WEBP images are allowed.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5 MB.')
    }

    const extension = file.type.split('/')[1].replace('jpeg', 'jpg')
    const fileName = `${restaurantId}/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(fileName)

    return data.publicUrl
  },

  async deleteMenuImage(imageUrl: string) {
    const marker = `/storage/v1/object/public/${BUCKET}/`
    const index = imageUrl.indexOf(marker)

    if (index === -1) return

    const filePath = decodeURIComponent(
      imageUrl.substring(index + marker.length),
    )

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([filePath])

    if (error) throw error
  },
}
