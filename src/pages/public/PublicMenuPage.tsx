
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Globe, Utensils, AlertCircle } from 'lucide-react'
import { publicMenuService } from '../../services/public-menu.service'
import type {
  PublicMenuData,
  Category,
  MenuItem,
} from '../../services/public-menu.service'

type Language = 'en' | 'my'

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>()

  const [menu, setMenu] = useState<PublicMenuData | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadMenu() {
      if (!slug) {
        setError('Invalid restaurant URL.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const data = await publicMenuService.getBySlug(slug)
        setMenu(data)
      } catch (err) {
        console.error('Public menu error:', err)
        setError('Restaurant menu is unavailable.')
      } finally {
        setLoading(false)
      }
    }

    loadMenu()
  }, [slug])

  const categories = menu?.categories ?? []
  const menuItems = menu?.menuItems ?? []

  const filteredItems = menuItems.filter((item) =>
    selectedCategory === 'all'
      ? true
      : item.category_id === selectedCategory
  )

  const getCategoryName = (category: Category) =>
    language === 'en' ? category.name_en : category.name_my

  const getItemName = (item: MenuItem) =>
    language === 'en' ? item.name_en : item.name_my

  const getItemDescription = (item: MenuItem) =>
    language === 'en'
      ? item.description_en
      : item.description_my

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(language === 'en' ? 'en-JP' : 'my-MM', {
      style: 'currency',
      currency: menu?.restaurant.currency || 'JPY',
      maximumFractionDigits: 0,
    }).format(price)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Utensils className="mx-auto mb-3 h-8 w-8 animate-pulse text-orange-600" />
          <p className="text-sm text-stone-500">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-sm text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h1 className="text-xl font-bold text-stone-800">
            {language === 'en' ? 'Menu unavailable' : 'မီနူးကို ကြည့်မရပါ'}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {error || 'Restaurant not found.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* Restaurant Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-5xl px-4 py-8 text-center">
          {menu.restaurant.logo_url ? (
            <img
              src={menu.restaurant.logo_url}
              alt={menu.restaurant.name}
              className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <Utensils className="mx-auto mb-4 h-10 w-10 text-orange-600" />
          )}

          <h1 className="text-2xl font-bold sm:text-3xl">
            {menu.restaurant.name}
          </h1>

          {menu.restaurant.description && (
            <p className="mx-auto mt-2 max-w-xl text-sm text-stone-500">
              {menu.restaurant.description}
            </p>
          )}

          <div className="mt-5 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border bg-stone-50 p-1">
              <Globe className="ml-2 h-4 w-4 text-stone-500" />

              <button
                onClick={() => setLanguage('en')}
                className={`rounded-full px-4 py-2 text-sm ${
                  language === 'en'
                    ? 'bg-orange-600 text-white'
                    : 'text-stone-600'
                }`}
              >
                English
              </button>

              <button
                onClick={() => setLanguage('my')}
                className={`rounded-full px-4 py-2 text-sm ${
                  language === 'my'
                    ? 'bg-orange-600 text-white'
                    : 'text-stone-600'
                }`}
              >
                မြန်မာ
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Category Navigation */}
        <div className="sticky top-0 z-10 -mx-4 overflow-x-auto border-b border-stone-200 bg-stone-50/95 px-4 py-3 backdrop-blur">
          <div className="flex min-w-max gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'border border-stone-200 bg-white text-stone-600'
              }`}
            >
              {language === 'en' ? 'All' : 'အားလုံး'}
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 text-white'
                    : 'border border-stone-200 bg-white text-stone-600'
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <section className="mt-6">
          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 py-16 text-center">
              <Utensils className="mx-auto mb-3 h-8 w-8 text-stone-300" />
              <p className="text-stone-500">
                {language === 'en'
                  ? 'No menu items available.'
                  : 'မီနူးမရှိသေးပါ။'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={getItemName(item)}
                      loading="lazy"
                      className="h-52 w-full object-cover"
                    />
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-lg">
                        {getItemName(item)}
                      </h2>

                      <span className="shrink-0 font-bold text-orange-700">
                        {formatPrice(Number(item.price))}
                      </span>
                    </div>

                    {getItemDescription(item) && (
                      <p className="mt-2 text-sm leading-6 text-stone-500">
                        {getItemDescription(item)}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="mt-12 border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-400">
        {menu.restaurant.name}
      </footer>
    </div>
  )
}
