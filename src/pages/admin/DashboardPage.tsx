
import { useEffect, useState } from 'react'
import {
  Tags,
  UtensilsCrossed,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react'

import { supabase } from '../../services/supabase'
import { useAuth } from '../../contexts/AuthContext'
import type { Restaurant } from '../../types/database'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { user } = useAuth()

  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null)

  const [stats, setStats] = useState({
    categories: 0,
    items: 0,
    available: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      if (!user) return

      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .maybeSingle()

        if (error) throw error

        setRestaurant(data)

        if (!data) return

        const [categories, items, available] =
          await Promise.all([
            supabase
              .from('categories')
              .select('*', { count: 'exact', head: true })
              .eq('restaurant_id', data.id),

            supabase
              .from('menu_items')
              .select('*', { count: 'exact', head: true })
              .eq('restaurant_id', data.id),

            supabase
              .from('menu_items')
              .select('*', { count: 'exact', head: true })
              .eq('restaurant_id', data.id)
              .eq('is_available', true),
          ])

        if (categories.error) throw categories.error
        if (items.error) throw items.error
        if (available.error) throw available.error

        setStats({
          categories: categories.count ?? 0,
          items: items.count ?? 0,
          available: available.count ?? 0,
        })
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to load dashboard'
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [user])

  const cards = [
    {
      title: 'Total Categories',
      value: stats.categories,
      icon: Tags,
    },
    {
      title: 'Total Menu Items',
      value: stats.items,
      icon: UtensilsCrossed,
    },
    {
      title: 'Available Items',
      value: stats.available,
      icon: Eye,
    },
  ]

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>
  }

  if (!restaurant) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <Store className="mb-3 text-slate-400" size={30} />
        <h2 className="text-lg font-semibold">
          Restaurant not found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Please create your restaurant record in Supabase.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-slate-500">
          Welcome back!
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here's what's happening with your restaurant.
        </p>
      </div>

      <section className="rounded-2xl bg-slate-900 p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-300">
              Your Restaurant
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {restaurant.name}
            </h2>

            <p className="mt-2 text-sm text-slate-300">
              /menu/{restaurant.slug}
            </p>
          </div>

          <div className="rounded-xl bg-white/10 p-4">
            <Store size={30} />
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 text-sm">
          {restaurant.is_published ? (
            <>
              <Eye size={16} />
              Published
            </>
          ) : (
            <>
              <EyeOff size={16} />
              Not published
            </>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <div className="rounded-xl bg-slate-100 p-3">
                  <Icon size={20} className="text-slate-700" />
                </div>
              </div>

              <p className="mt-5 text-3xl font-bold">
                {card.value}
              </p>
            </div>
          )
        })}
      </section>
    </div>
  )
}
