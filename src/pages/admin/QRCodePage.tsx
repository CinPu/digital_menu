
import { useEffect, useRef, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import {
  Download,
  Printer,
  ExternalLink,
  QrCode,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { supabase } from '../../services/supabase'
import type { Restaurant } from '../../types/database'
import { toast } from 'sonner'

export default function QRCodePage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const qrRef = useRef<HTMLCanvasElement>(null)

  const menuUrl = restaurant
    ? `${window.location.origin}/menu/${restaurant.slug}`
    : ''

  useEffect(() => {
    async function loadRestaurant() {
      try {
        setLoading(true)
        setError('')

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) throw authError
        if (!user) throw new Error('Please login again.')

        const { data, error: restaurantError } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (restaurantError) throw restaurantError

        setRestaurant(data as Restaurant)
      } catch (err) {
        console.error('QR Code page error:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load restaurant information.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadRestaurant()
  }, [])

  const downloadQRCode = () => {
    const canvas = qrRef.current

    if (!canvas) {
      toast.error('QR Code is not ready.')
      return
    }

    const link = document.createElement('a')
    link.download = `${restaurant?.slug}-qr-code.png`
    link.href = canvas.toDataURL('image/png')
    link.click()

    toast.success('QR Code downloaded successfully.')
  }

  const openMenu = () => {
    if (!menuUrl) return
    window.open(menuUrl, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="font-medium text-red-700">
          {error || 'Restaurant not found.'}
        </p>
      </div>
    )
  }

  const isPublished = restaurant.is_published

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            QR Code
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Generate and download your restaurant menu QR Code.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={openMenu}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <ExternalLink size={16} />
            Preview Menu
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Printer size={16} />
            Print
          </button>

          <button
            onClick={downloadQRCode}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            <Download size={16} />
            Download PNG
          </button>
        </div>
      </div>

      {!isPublished && (
        <div className="no-print rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Your restaurant menu is not published yet. Publish it in Restaurant
          Settings before sharing this QR Code with customers.
        </div>
      )}

      {/* QR Code Print Area */}
      <div className="qr-print-area flex justify-center">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          {restaurant.logo_url && (
            <img
              src={restaurant.logo_url}
              alt={restaurant.name}
              className="mx-auto mb-4 h-20 w-20 rounded-full border border-gray-100 object-cover"
            />
          )}

          <h2 className="text-2xl font-bold text-gray-900">
            {restaurant.name}
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Scan to view our menu
          </p>

          <div className="my-7 flex justify-center">
            <div className="rounded-xl border border-gray-100 bg-white p-3">
              <QRCodeCanvas
                ref={qrRef}
                value={menuUrl}
                size={256}
                level="H"
                includeMargin
              />
            </div>
          </div>

          <p className="text-lg font-semibold text-gray-800">
            Scan Me
          </p>

          <p className="mt-2 break-all text-xs text-gray-400">
            {menuUrl}
          </p>

          <p className="mt-6 text-xs text-gray-400">
            Thank you for visiting!
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="no-print rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">
            How to use your QR Code
          </h3>
        </div>

        <ol className="mt-4 list-inside list-decimal space-y-2 text-sm text-gray-600">
          <li>Download your QR Code as a PNG image.</li>
          <li>Print it and place it on your restaurant tables.</li>
          <li>Customers scan the QR Code using their phone camera.</li>
          <li>They can view your restaurant menu instantly.</li>
        </ol>
      </div>
    </div>
  )
}
