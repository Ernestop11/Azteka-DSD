'use client'

/**
 * Las Superior Pricing Import Page
 * 
 * Special tool for importing Las Superior pricing from Excel
 * Handles 9 stores with special pricing, 15-day terms, etc.
 */

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import {
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  DollarSign,
} from 'lucide-react'

export default function LasSuperiorImportPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Fetch Las Superior customers (9 stores)
  const { data: lasSuperiorCustomers } = useQuery({
    queryKey: ['las-superior-customers'],
    queryFn: async () => {
      const res = await fetch('/api/admin/customers?search=las superior')
      if (!res.ok) throw new Error('Failed to fetch customers')
      const json = await res.json()
      return json.data || json || []
    },
  })

  const customers = lasSuperiorCustomers || []

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('customerType', 'las-superior')

      const res = await fetch('/api/admin/pricing/import-las-superior', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to import')
      }

      return res.json()
    },
    onSuccess: (data) => {
      toast(`Successfully imported ${data.successful} price overrides`, 'success')
      setIsUploading(false)
      setFile(null)
    },
    onError: (error: Error) => {
      toast(error.message || 'Failed to import pricing', 'error')
      setIsUploading(false)
    },
  })

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (
        selectedFile.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.type === 'application/vnd.ms-excel' ||
        selectedFile.name.endsWith('.xlsx') ||
        selectedFile.name.endsWith('.xls')
      ) {
        setFile(selectedFile)
      } else {
        toast('Please select an Excel file (.xlsx or .xls)', 'error')
      }
    }
  }

  const handleUpload = () => {
    if (!file) {
      toast('Please select a file first', 'error')
      return
    }

    setIsUploading(true)
    uploadMutation.mutate(file)
  }

  const downloadTemplate = () => {
    // Create template CSV
    const template = `customerEmail,productSku,overrideType,fixedPrice,discountPercent,discountAmount,minQuantity,maxQuantity,contractNumber,notes,startDate,endDate,active
las.superior.store1@example.com,SKU-001,FIXED_PRICE,22.99,,,,,CONTRACT-LS-001,Las Superior Store 1 pricing,,,,true
las.superior.store2@example.com,SKU-001,FIXED_PRICE,23.50,,,,,CONTRACT-LS-001,Las Superior Store 2 pricing,,,,true
las.superior.store1@example.com,SKU-002,PERCENTAGE_DISCOUNT,,10,,,,,CONTRACT-LS-001,10% volume discount,,,,true`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'las-superior-pricing-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/pricing')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Las Superior Pricing Import
                </h1>
                <p className="text-sm text-gray-600">
                  Import pricing for all 9 Las Superior stores
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Las Superior Special Pricing
          </h2>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• 9 stores with individual pricing</li>
            <li>• 15-day payment terms</li>
            <li>• Higher prices than standard customers</li>
            <li>• Returns/credit memo support</li>
            <li>• Open invoice statements</li>
          </ul>
        </div>

        {/* Las Superior Stores */}
        {customers.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Las Superior Stores ({customers.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customers.map((customer: any) => (
                <div
                  key={customer.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Building2 className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {customer.businessName}
                    </p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Import Pricing File
          </h3>

          <div className="space-y-4">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Excel File (.xlsx or .xls)
              </label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                  className="flex-1"
                />
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Template
                </Button>
              </div>
              {file && (
                <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            {/* File Format Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Expected Format:
              </h4>
              <div className="text-xs text-gray-600 space-y-1 font-mono">
                <p>customerEmail, productSku, overrideType, fixedPrice, ...</p>
                <p className="mt-2">
                  Example: las.superior.store1@example.com, SKU-001,
                  FIXED_PRICE, 22.99
                </p>
              </div>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="w-full flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Las Superior Pricing
                </>
              )}
            </Button>
          </div>

          {/* Results */}
          {uploadMutation.data && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Import Complete</h4>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  ✅ Successful: {uploadMutation.data.successful} price overrides
                </p>
                {uploadMutation.data.failed > 0 && (
                  <p>❌ Failed: {uploadMutation.data.failed} items</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Instructions
          </h3>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>
              Download the template CSV or prepare your Excel file with the
              required columns
            </li>
            <li>
              Fill in pricing for each Las Superior store (use customer email to
              identify stores)
            </li>
            <li>
              Set overrideType to FIXED_PRICE for exact prices, or
              PERCENTAGE_DISCOUNT for discounts
            </li>
            <li>Add contract number: CONTRACT-LS-001 (or your contract number)</li>
            <li>Upload the file and review results</li>
            <li>
              Verify prices in the Price Management page (
              <button
                onClick={() => router.push('/admin/pricing')}
                className="text-blue-600 hover:underline"
              >
                /admin/pricing
              </button>
              )
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}




