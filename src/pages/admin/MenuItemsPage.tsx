
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Plus, Pencil, Trash2, X, Search, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../services/supabase'
import { menuItemService, type MenuItemInput } from '../../services/menu-item.service'
import type { Category, MenuItem } from '../../types/database'
import { storageService } from '../../services/storage.service'
import { ImagePlus } from 'lucide-react'

const PAGE_SIZE = 8

const emptyForm: MenuItemInput = {
  category_id: null,
  name_en: '',
  name_my: '',
  description_en: '',
  description_my: '',
  price: 0,
  image_url: null,
  is_available: true,
  sort_order: 0,
}

export default function MenuItemsPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurantId, setRestaurantId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<MenuItemInput>(emptyForm)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  async function loadData() {
    try {
      setLoading(true)

      const { data: { user }, error: authError } =
        await supabase.auth.getUser()

      if (authError) throw authError
      if (!user) throw new Error('Please login again.')

      const { data: restaurant, error: restaurantError } =
        await supabase
          .from('restaurants')
          .select('id')
          .eq('owner_id', user.id)
          .maybeSingle()

      if (restaurantError) throw restaurantError
      if (!restaurant) throw new Error('Restaurant not found.')

      setRestaurantId(restaurant.id)

      const [menuItems, categoryResult] = await Promise.all([
        menuItemService.getAll(restaurant.id),
        supabase
          .from('categories')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .order('sort_order', { ascending: true }),
      ])

      if (categoryResult.error) throw categoryResult.error

      setItems(menuItems)
      setCategories((categoryResult.data ?? []) as Category[])
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load menu items.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    if (!keyword) return items

    return items.filter((item) => {
      const category = categories.find(
        (cat) => cat.id === item.category_id,
      )

      return [
        item.name_en,
        item.name_my,
        category?.name_en,
        category?.name_my,
      ].some((value) => value?.toLowerCase().includes(keyword))
    })
  }, [items, categories, search])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  )

  function openCreateForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
    setPreviewUrl(null)
  }

  function openEditForm(item: MenuItem) {
    setEditingId(item.id)
    setForm({
      category_id: item.category_id,
      name_en: item.name_en,
      name_my: item.name_my,
      description_en: item.description_en ?? '',
      description_my: item.description_my ?? '',
      price: item.price,
      image_url: item.image_url,
      is_available: item.is_available,
      sort_order: item.sort_order,
    })
    setShowForm(true)
    setPreviewUrl(item.image_url)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name_en.trim() || !form.name_my.trim()) {
      toast.error('Please enter both English and Myanmar names.')
      return
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      toast.error('Please enter a valid price.')
      return
    }

    try {
      setSaving(true)

      const input: MenuItemInput = {
        ...form,
        category_id: form.category_id || null,
        name_en: form.name_en.trim(),
        name_my: form.name_my.trim(),
        description_en: form.description_en.trim(),
        description_my: form.description_my.trim(),
        price: Number(form.price),
        image_url: form.image_url?.trim() || null,
        sort_order: Number(form.sort_order) || 0,
      }

      if (editingId) {
        await menuItemService.update(editingId, input)
        toast.success('Menu item updated.')
      } else {
        await menuItemService.create(restaurantId, input)
        toast.success('Menu item created.')
      }

      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      await loadData()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save menu item.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item: MenuItem) {
    if (!window.confirm(`Delete "${item.name_en}"?`)) return

    try {
      await menuItemService.delete(item.id)
      setItems((current) => current.filter((row) => row.id !== item.id))
      toast.success('Menu item deleted.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete menu item.',
      )
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      const input: MenuItemInput = {
        category_id: item.category_id,
        name_en: item.name_en,
        name_my: item.name_my,
        description_en: item.description_en ?? '',
        description_my: item.description_my ?? '',
        price: item.price,
        image_url: item.image_url,
        is_available: !item.is_available,
        sort_order: item.sort_order,
      }

      await menuItemService.update(item.id, input)

      setItems((current) =>
        current.map((row) =>
          row.id === item.id
            ? { ...row, is_available: !row.is_available }
            : row,
        ),
      )

      toast.success('Availability updated.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to update availability.',
      )
    }
  }

  function categoryName(categoryId: string | null) {
    if (!categoryId) return 'Uncategorized'

    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name_en ?? 'Uncategorized'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Items</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your food and drink menu.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus size={18} />
          Add Menu Item
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {editingId ? 'Edit Menu Item' : 'Create Menu Item'}
            </h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Close form"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Name (English)
                </label>
                <input
                  required
                  maxLength={150}
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                  placeholder="e.g. Chicken Ramen"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Name (Myanmar)
                </label>
                <input
                  required
                  maxLength={150}
                  value={form.name_my}
                  onChange={(e) => setForm({ ...form, name_my: e.target.value })}
                  placeholder="ဥပမာ - ကြက်သားရာမင်"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Category
                </label>
                <select
                  value={form.category_id ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, category_id: e.target.value || null })
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name_en} / {category.name_my}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Price (MYR)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description (English)
                </label>
                <textarea
                  rows={3}
                  value={form.description_en}
                  onChange={(e) =>
                    setForm({ ...form, description_en: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description (Myanmar)
                </label>
                <textarea
                  rows={3}
                  value={form.description_my}
                  onChange={(e) =>
                    setForm({ ...form, description_my: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              
<div className="sm:col-span-2">
  <label className="mb-2 block text-sm font-medium">
    Food Image
  </label>

  <div className="flex flex-wrap items-start gap-4">
    {previewUrl && (
      <img
        src={previewUrl}
        alt="Food preview"
        className="h-32 w-40 rounded-lg border object-cover"
      />
    )}

    <div className="flex flex-col gap-2">
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
        {uploading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <ImagePlus size={18} />
        )}

        {uploading ? 'Uploading...' : 'Choose Image'}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading || saving}
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = ''

            if (!file || !restaurantId) return

            try {
              setUploading(true)
              const { data: { user }, error: authError } =
                await supabase.auth.getUser()
console.log('AUTH USER:', user?.id)
console.log('AUTH ERROR:', authError)
console.log('RESTAURANT ID:', restaurantId)

const { data: restaurant, error: restaurantError } =
  await supabase
    .from('restaurants')
    .select('id, owner_id')
    .eq('id', restaurantId)
    .single()

console.log('RESTAURANT:', restaurant)
console.log('RESTAURANT ERROR:', restaurantError)
               
              const imageUrl =
                await storageService.uploadMenuImage(
                  file,
                  restaurantId,
                )

              setForm((current) => ({
                ...current,
                image_url: imageUrl,
              }))

              setPreviewUrl(imageUrl)
              toast.success('Image uploaded successfully.')
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : 'Image upload failed.',
              )
            } finally {
              setUploading(false)
            }
          }}
        />
      </label>

      <p className="text-xs text-slate-500">
        JPG, PNG, WEBP · Maximum 5 MB
      </p>

      {previewUrl && (
        <button
          type="button"
          onClick={() => {
            setForm((current) => ({
              ...current,
              image_url: null,
            }))
            setPreviewUrl(null)
          }}
          className="text-left text-sm text-red-600"
        >
          Remove image
        </button>
      )}
    </div>
  </div>
</div>


              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Sort Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm({ ...form, sort_order: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5"
                />
              </div>

              <label className="flex items-center gap-2 self-end pb-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) =>
                    setForm({ ...form, is_available: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                Available
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Update Item' : 'Save Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search by name or category..."
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3"
          />
        </div>
        <div className="self-center text-sm text-slate-500">
          {filteredItems.length} menu items
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Loading menu items...
          </div>
        ) : paginatedItems.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-slate-800">No menu items found</p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first item or change your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Availability</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name_en}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                            No image
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.name_en}
                          </p>
                          <p className="text-slate-500">{item.name_my}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {categoryName(item.category_id)}
                    </td>
                    <td className="px-5 py-4 font-medium">
                      ¥{Number(item.price).toLocaleString('ja-JP')}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => void toggleAvailability(item)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          item.is_available
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.is_available ? 'Available' : 'Sold Out'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(item)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          aria-label="Edit menu item"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => void handleDelete(item)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          aria-label="Delete menu item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="flex items-center justify-between border-t px-5 py-4">
            <p className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
