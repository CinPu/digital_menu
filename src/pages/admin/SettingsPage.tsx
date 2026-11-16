
import { useEffect, useState } from 'react'
import {
  Save,
  Store,
  Upload,
  Loader2,
  ExternalLink,
  Globe,
  ImagePlus,
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import { storageService } from '../../services/storage.service'
import type { Restaurant } from '../../types/database'
import { toast } from 'sonner'

export default function SettingsPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('JPY')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isPublished, setIsPublished] = useState(false)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError
        if (!user) throw new Error('Please login again.')

        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (error) throw error

        const current = data as Restaurant

        setRestaurant(current)
        setName(current.name)
        setDescription(current.description ?? '')
        setCurrency(current.currency || 'JPY')
        setLogoUrl(current.logo_url)
        setIsPublished(current.is_published)
      } catch (error) {
        console.error('Settings load error:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Unable to load restaurant settings.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !restaurant) return

    try {
      setUploading(true)

      const publicUrl = await storageService.uploadMenuImage(
        file,
        restaurant.id
      )

      setLogoUrl(publicUrl)
      toast.success('Restaurant logo uploaded successfully.')
    } catch (error) {
      console.error('Logo upload error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Logo upload failed.'
      )
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!restaurant) return

    if (!name.trim()) {
      toast.error('Restaurant name is required.')
      return
    }

    try {
      setSaving(true)

      const { data, error } = await supabase
        .from('restaurants')
        .update({
          name: name.trim(),
          description: description.trim() || null,
          logo_url: logoUrl,
          currency,
          is_published: isPublished,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurant.id)
        .select()
        .single()

      if (error) throw error

      setRestaurant(data as Restaurant)
      toast.success('Restaurant settings saved successfully.')
    } catch (error) {
      console.error('Settings save error:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Unable to save settings.'
      )
    } finally {
      setSaving(false)
    }
  }

  const menuUrl = restaurant
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : ''

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
        Restaurant information not found.
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Restaurant Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your restaurant information and public menu.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* Restaurant Information */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <Store className="text-orange-600" size={20} />
            <h2 className="text-lg font-semibold">
              Restaurant Information
            </h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Restaurant Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={150}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="My Restaurant"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                placeholder="Tell customers about your restaurant..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-orange-500"
              >
                <option value="MYR">MYR - Malaysian Ringgit (RM)</option>
                <option value="USD">USD - US Dollar ($)</option>
                <option value="MMK">MMK - Myanmar Kyat (K)</option>
                <option value="THB">THB - Thai Baht (฿)</option>
                <option value="SGD">SGD - Singapore Dollar (S$)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Restaurant Logo */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <ImagePlus className="text-orange-600" size={20} />
            <h2 className="text-lg font-semibold">
              Restaurant Logo
            </h2>
          </div>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Restaurant logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store size={36} className="text-gray-300" />
              )}
            </div>

            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-gray-50">
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {uploading ? 'Uploading...' : 'Upload Logo'}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-xs text-gray-500">
                JPG, PNG or WEBP. Maximum 5 MB.
              </p>

              {logoUrl && (
                <button
                  type="button"
                  onClick={() => setLogoUrl(null)}
                  className="mt-2 block text-sm text-red-600 hover:underline"
                >
                  Remove logo
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Publishing */}
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-2">
            <Globe className="text-orange-600" size={20} />
            <h2 className="text-lg font-semibold">
              Public Menu Settings
            </h2>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-gray-900">
                Publish Restaurant Menu
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Allow customers to view your menu using the QR Code.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center gap-3">
              <span className="text-sm font-medium">
                {isPublished ? 'Published' : 'Unpublished'}
              </span>

              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-5 w-5 accent-orange-600"
              />
            </label>
          </div>

          <div className="mt-5 rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-xs font-medium text-gray-500">
              PUBLIC MENU URL
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="break-all text-sm text-gray-700">
                {menuUrl}
              </span>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(menuUrl)
                  toast.success('Menu URL copied.')
                }}
                className="shrink-0 text-sm font-medium text-orange-600 hover:underline"
              >
                Copy URL
              </button>
            </div>

            <a
              href={menuUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm text-orange-600 hover:underline"
            >
              Preview Menu <ExternalLink size={14} />
            </a>
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
