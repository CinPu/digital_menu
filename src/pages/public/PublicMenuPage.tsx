
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Globe,
  Utensils,
  AlertCircle,
  Search,
  ChevronRight,
  Leaf,
} from 'lucide-react'

import { publicMenuService } from '../../services/public-menu.service'

import type { PublicMenuData } from '../../services/public-menu.service'
import type { Category, MenuItem } from '../../types/database'

type Language = 'en' | 'my'

export default function PublicMenuPage() {
  const { slug } = useParams<{ slug: string }>()

  const [menu, setMenu] = useState<PublicMenuData | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
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

  const getCategoryName = (category: Category) =>
    language === 'en' ? category.name_en : category.name_my

  const getItemName = (item: MenuItem) =>
    language === 'en' ? item.name_en : item.name_my

  const getItemDescription = (item: MenuItem) =>
    language === 'en' ? item.description_en : item.description_my

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(language === 'en' ? 'en-JP' : 'my-MM', {
      style: 'currency',
      currency: menu?.restaurant.currency || 'JPY',
      maximumFractionDigits: 0,
    }).format(price)

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category_id === selectedCategory

      const keyword = search.toLowerCase().trim()

      const matchesSearch =
        !keyword ||
        item.name_en.toLowerCase().includes(keyword) ||
        item.name_my.includes(keyword) ||
        (item.description_en || '').toLowerCase().includes(keyword) ||
        (item.description_my || '').includes(keyword)

      return matchesCategory && matchesSearch
    })
  }, [menuItems, selectedCategory, search])

  const text = {
    menu: language === 'en' ? 'Our Menu' : 'ကျွန်ုပ်တို့၏ မီနူး',
    subtitle:
      language === 'en'
        ? 'Discover something delicious.'
        : 'အရသာရှိတဲ့ အစားအစာများကို ရွေးချယ်လိုက်ပါ။',
    all: language === 'en' ? 'All Items' : 'အားလုံး',
    search:
      language === 'en'
        ? 'Search delicious food...'
        : 'အစားအစာ ရှာဖွေရန်...',
    items: language === 'en' ? 'items' : 'မျိုး',
    unavailable:
      language === 'en' ? 'Menu unavailable' : 'မီနူးကို ကြည့်မရပါ',
    empty:
      language === 'en'
        ? 'No menu items found'
        : 'မီနူးပစ္စည်း မတွေ့ပါ',
    emptyDescription:
      language === 'en'
        ? 'Try another category or search keyword.'
        : 'အခြားအမျိုးအစား သို့မဟုတ် စာလုံးဖြင့် ရှာကြည့်ပါ။',
    footer:
      language === 'en'
        ? 'Made with love. Enjoy your meal!'
        : 'မေတ္တာဖြင့် ပြင်ဆင်ထားပါသည်။ သုံးဆောင်နိုင်ပါပြီ။',
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
            <Utensils className="h-8 w-8 animate-pulse text-orange-600" />
          </div>
          <p className="text-sm font-medium text-stone-500">
            Preparing your menu...
          </p>
        </div>
      </div>
    )
  }

  if (error || !menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f5] px-4">
        <div className="max-w-sm rounded-3xl bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h1 className="text-xl font-bold text-stone-800">
            {text.unavailable}
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            {error || 'Restaurant not found.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800">

      {/* Top Navigation */}
      <nav className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-3 sm:px-6">

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {menu.restaurant.logo_url ? (
              <img
                src={menu.restaurant.logo_url}
                alt={menu.restaurant.name}
                className="h-9 w-9 shrink-0 rounded-xl object-cover sm:h-10 sm:w-10"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 sm:h-10 sm:w-10">
                <Utensils className="h-5 w-5 text-orange-600" />
              </div>
            )}

            <span className="truncate text-sm font-bold text-stone-900 sm:text-base">
              {menu.restaurant.name}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-full bg-stone-100 p-1">
            <Globe className="ml-1 h-4 w-4 text-stone-500" />

            <button
              onClick={() => setLanguage('en')}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                language === 'en'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-white'
              }`}
            >
              EN
            </button>

            <button
              onClick={() => setLanguage('my')}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                language === 'my'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-white'
              }`}
            >
              မြန်မာ
            </button>
          </div>
        </div>
      </nav>

      {/* Restaurant Hero */}
      <header className="relative overflow-hidden bg-[#211b17]">
        <div className="absolute -right-24 -top-32 h-80 w-80 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-12 text-center sm:py-20">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-xl sm:h-20 sm:w-20">
            {menu.restaurant.logo_url ? (
              <img
                src={menu.restaurant.logo_url}
                alt={menu.restaurant.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <Utensils className="h-8 w-8 text-orange-400" />
            )}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-5xl">
            {menu.restaurant.name}
          </h1>

          {menu.restaurant.description && (
  <p
    className="mx-auto mt-4 max-w-xl text-xs leading-6 text-stone-300 sm:text-base sm:leading-7"
    dangerouslySetInnerHTML={{
      __html: menu.restaurant.description,
    }}
  />
)}

          <div className="mx-auto mt-6 h-1 w-16 rounded-full bg-orange-500" />
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-3 pb-12 sm:px-6 sm:pb-16">

        {/* Menu Heading */}
        <div className="flex items-end justify-between gap-3 pt-7 sm:pt-10">

          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600 sm:text-xs">
              {menu.restaurant.name}
            </p>

            <h2 className="text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">
              {text.menu}
            </h2>

            <p className="mt-1 text-xs text-stone-500 sm:mt-2 sm:text-sm">
              {text.subtitle}
            </p>
          </div>

          <div className="shrink-0 pb-1 text-xs font-medium text-stone-500 sm:text-sm">
            {filteredItems.length} {text.items}
          </div>
        </div>

        {/* Search */}
        <div className="relative mt-5 sm:mt-8">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 sm:left-4 sm:h-5 sm:w-5" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={text.search}
            className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-xs outline-none transition placeholder:text-stone-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 sm:h-14 sm:rounded-2xl sm:pl-12 sm:text-sm"
          />
        </div>

        {/* Categories */}
        <div className="sticky top-16 z-20 -mx-3 mt-4 border-b border-stone-200/70 bg-[#faf8f5]/95 px-3 py-3 backdrop-blur-xl sm:-mx-6 sm:mt-6 sm:px-6 sm:py-4">
          <div className="flex gap-2 overflow-x-auto pb-1">

            <button
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm ${
                selectedCategory === 'all'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'border border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {text.all}
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm ${
                  selectedCategory === category.id
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'border border-stone-200 bg-white text-stone-600 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <section className="mt-5 sm:mt-8">

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-4 py-16 text-center sm:rounded-3xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100">
                <Search className="h-6 w-6 text-stone-400" />
              </div>

              <h3 className="text-base font-bold text-stone-800 sm:text-lg">
                {text.empty}
              </h3>

              <p className="mt-2 text-xs text-stone-500 sm:text-sm">
                {text.emptyDescription}
              </p>

              <button
                onClick={() => {
                  setSearch('')
                  setSelectedCategory('all')
                }}
                className="mt-5 text-xs font-bold text-orange-600 hover:text-orange-700 sm:text-sm"
              >
                {language === 'en' ? 'Clear filters' : 'ပြန်လည်ရှာဖွေရန်'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:gap-5">

              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  language={language}
                  price={formatPrice(Number(item.price))}
                  name={getItemName(item)}
                  description={getItemDescription(item)}
                />
              ))}

            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-7 text-center sm:py-8">

          <div className="mb-3 flex items-center justify-center gap-2">
            <Utensils className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-bold text-stone-800">
              {menu.restaurant.name}
            </span>
          </div>

          <p className="text-[11px] text-stone-400 sm:text-xs">
            {text.footer}
          </p>

          <p className="mt-4 text-[9px] tracking-widest text-stone-300">
            DIGITAL MENU
          </p>
        </div>
      </footer>
    </div>
  )
}

function MenuCard({
  item,
  language,
  price,
  name,
  description,
}: {
  item: MenuItem
  language: Language
  price: string
  name: string
  description: string | null | undefined
}) {
  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-stone-200/80 bg-white transition duration-300 hover:border-orange-200 hover:shadow-lg sm:rounded-2xl md:rounded-3xl">

      {/* Food Image */}
      <div className="relative h-32 overflow-hidden bg-stone-100 sm:h-40 md:h-44">

        {item.image_url ? (
          <img
            src={item.image_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="h-8 w-8 text-stone-300 sm:h-12 sm:w-12" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-60" />

        <div className="absolute bottom-2 right-2 max-w-[90%] rounded-lg bg-white/95 px-2 py-1.5 shadow-md backdrop-blur sm:bottom-3 sm:right-3 sm:rounded-xl sm:px-3 sm:py-2">
          <span className="text-xs font-extrabold text-orange-700 sm:text-base">
            {price}
          </span>
        </div>
      </div>

      {/* Food Details */}
      <div className="p-3 sm:p-4 md:p-5">

        <div className="flex items-start justify-between gap-1.5">
          <h3 className="min-w-0 break-words text-sm font-bold leading-snug text-stone-900 transition group-hover:text-orange-700 sm:text-base">
            {name}
          </h3>

          {/* <div className="mt-0.5 shrink-0 rounded-full bg-orange-50 p-1.5 sm:p-2">
            <Leaf className="h-3 w-3 text-orange-600 sm:h-4 sm:w-4" />
          </div> */}
        </div>

        {description && (
          <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-stone-500 sm:mt-3 sm:text-sm sm:leading-6">
            {description}
          </p>
        )}

        {/* <div className="mt-3 flex items-center justify-between gap-1 border-t border-stone-100 pt-3 sm:mt-5 sm:pt-4">
          <span className="text-[10px] font-medium text-stone-400 sm:text-xs">
            {language === 'en' ? 'Menu item' : 'အစားအစာ'}
          </span>

          <span className="flex shrink-0 items-center gap-0.5 text-[10px] font-semibold text-orange-600 sm:gap-1 sm:text-xs">
            {language === 'en' ? 'Details' : 'အသေးစိတ်'}
            <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </span>
        </div> */}

      </div>
    </article>
  )
}
