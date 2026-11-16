
import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../services/supabase'
import {
  categoryService,
  type CategoryInput,
} from '../../services/category.service'
import type { Category } from '../../types/database'

const emptyForm: CategoryInput = {
  name_en: '',
  name_my: '',
  sort_order: 0,
  is_active: true,
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [restaurantId, setRestaurantId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryInput>(emptyForm)

  async function loadCategories() {
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
      if (!restaurant) {
        throw new Error('Restaurant record not found.')
      }

      setRestaurantId(restaurant.id)

      const result = await categoryService.getAll(restaurant.id)
      setCategories(result)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to load categories.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  function openCreateForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEditForm(category: Category) {
    setEditingId(category.id)
    setForm({
      name_en: category.name_en,
      name_my: category.name_my,
      sort_order: category.sort_order,
      is_active: category.is_active,
    })
    setShowForm(true)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name_en.trim() || !form.name_my.trim()) {
      toast.error('Please enter both English and Burmese names.')
      return
    }

    try {
      setSaving(true)

      const input: CategoryInput = {
        ...form,
        name_en: form.name_en.trim(),
        name_my: form.name_my.trim(),
        sort_order: Number(form.sort_order) || 0,
      }

      if (editingId) {
        await categoryService.update(editingId, input)
        toast.success('Category updated successfully.')
      } else {
        await categoryService.create(restaurantId, input)
        toast.success('Category created successfully.')
      }

      setShowForm(false)
      setForm(emptyForm)
      setEditingId(null)
      await loadCategories()
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to save category.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Delete "${category.name_en}"? This action cannot be undone.`,
    )

    if (!confirmed) return

    try {
      await categoryService.delete(category.id)
      setCategories((current) =>
        current.filter((item) => item.id !== category.id),
      )
      toast.success('Category deleted successfully.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to delete category.',
      )
    }
  }

  async function toggleActive(category: Category) {
    try {
      await categoryService.update(category.id, {
        name_en: category.name_en,
        name_my: category.name_my,
        sort_order: category.sort_order,
        is_active: !category.is_active,
      })

      setCategories((current) =>
        current.map((item) =>
          item.id === category.id
            ? { ...item, is_active: !item.is_active }
            : item,
        ),
      )

      toast.success('Category status updated.')
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Unable to update status.',
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your restaurant menu categories.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              {editingId ? 'Edit Category' : 'Create Category'}
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
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category Name (English)
                </label>
                <input
                  value={form.name_en}
                  onChange={(event) =>
                    setForm({ ...form, name_en: event.target.value })
                  }
                  placeholder="e.g. Main Dishes"
                  required
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Category Name (Myanmar)
                </label>
                <input
                  value={form.name_my}
                  onChange={(event) =>
                    setForm({ ...form, name_my: event.target.value })
                  }
                  placeholder="ဥပမာ - အဓိကဟင်းလျာများ"
                  required
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      sort_order: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-900"
                />
              </div>

              <label className="flex items-center gap-2 self-end pb-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(event) =>
                    setForm({ ...form, is_active: event.target.checked })
                  }
                  className="h-4 w-4"
                />
                Active category
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingId ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-medium text-slate-800">
              No categories yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first category to organize your menu.
            </p>
            <button
              onClick={openCreateForm}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Add your first category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Sort Order</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {category.name_en}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {category.name_my}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {category.sort_order}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => void toggleActive(category)}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          category.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {category.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditForm(category)}
                          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                          aria-label="Edit category"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => void handleDelete(category)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          aria-label="Delete category"
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
      </div>
    </div>
  )
}
