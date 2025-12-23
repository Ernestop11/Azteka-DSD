'use client'

import { useEffect, useMemo, useState } from 'react'

type DiagnosticsResponse = {
  success: boolean
  timestamp: string
  stats: Record<string, any>
  problematicProducts: Array<{
    productId: string
    name: string
    sku: string
    imageUrl: string | null
    expectedFilename?: string
    fileExists: boolean
    fileSize?: number
    reason: string
    httpStatus?: number | null
    httpOk?: boolean | null
    publicUrl?: string | null
    httpError?: string | null
  }>
  notes?: {
    checkHttp?: boolean
    includeAll?: boolean
    limit?: number | null
    httpTimeoutMs?: number | null
  }
}

export default function AdminImageDiagnosticsPage() {
  const [data, setData] = useState<DiagnosticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkHttp, setCheckHttp] = useState(false)

  const endpoint = useMemo(() => {
    const params = new URLSearchParams()
    params.set('limit', '0')
    params.set('includeAll', 'false')
    if (checkHttp) params.set('checkHttp', 'true')
    if (checkHttp) params.set('httpTimeoutMs', '2000')
    return `/api/admin/diagnostics/images?${params.toString()}`
  }, [checkHttp])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(endpoint, {
        credentials: 'include',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })
      const json = (await res.json()) as DiagnosticsResponse
      if (!res.ok || !json?.success) {
        throw new Error((json as any)?.error || `HTTP ${res.status}`)
      }
      setData(json)
    } catch (e: any) {
      setError(e?.message || String(e))
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Image Diagnostics</h1>
              <p className="text-sm text-gray-600">DB vs disk vs public URL status</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={checkHttp}
                  onChange={(e) => setCheckHttp(e.target.checked)}
                  className="w-4 h-4"
                />
                Check HTTP (slower)
              </label>
              <button
                onClick={load}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        {data ? (
          <>
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-700">Last run: {new Date(data.timestamp).toLocaleString()}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-gray-500">Products w/ imageUrl</div>
                  <div className="font-semibold">{data.stats?.totalProductsWithImageUrl ?? '—'}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-gray-500">Files exist on disk</div>
                  <div className="font-semibold">{data.stats?.filesExistOnDisk ?? '—'}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-gray-500">Missing files</div>
                  <div className="font-semibold">{data.stats?.filesMissingFromDisk ?? '—'}</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-gray-500">Orphaned files</div>
                  <div className="font-semibold">{data.stats?.orphanedFiles ?? '—'}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-3">
                Uploads dir: {String(data.stats?.uploadsDirExists ? 'exists' : 'missing')} ({data.stats?.uploadsDirPath})
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 text-sm">Problematic products (sample)</h2>
                <p className="text-xs text-gray-600">Missing file, out of stock, or HTTP not OK</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="text-left px-4 py-2">Product</th>
                      <th className="text-left px-4 py-2">SKU</th>
                      <th className="text-left px-4 py-2">DB imageUrl</th>
                      <th className="text-left px-4 py-2">Disk</th>
                      <th className="text-left px-4 py-2">HTTP</th>
                      <th className="text-left px-4 py-2">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(data.problematicProducts || []).map((row) => (
                      <tr key={row.productId} className="align-top">
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-900">{row.name}</div>
                          <div className="text-xs text-gray-500">{row.productId}</div>
                        </td>
                        <td className="px-4 py-2 text-gray-700">{row.sku}</td>
                        <td className="px-4 py-2 text-gray-700 max-w-[380px]">
                          <div className="truncate" title={row.imageUrl || ''}>{row.imageUrl || '—'}</div>
                        </td>
                        <td className="px-4 py-2">
                          <span className={row.fileExists ? 'text-green-700' : 'text-red-700'}>
                            {row.fileExists ? 'exists' : 'missing'}
                          </span>
                          {row.fileSize ? <div className="text-xs text-gray-500">{row.fileSize} bytes</div> : null}
                        </td>
                        <td className="px-4 py-2">
                          {!checkHttp ? (
                            <span className="text-gray-400">(off)</span>
                          ) : row.httpError ? (
                            <span className="text-red-700" title={row.httpError}>error</span>
                          ) : row.httpStatus ? (
                            <span className={row.httpOk ? 'text-green-700' : 'text-red-700'}>
                              {row.httpStatus}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                          {row.publicUrl ? (
                            <div className="text-xs text-gray-500 truncate max-w-[280px]" title={row.publicUrl}>
                              {row.publicUrl}
                            </div>
                          ) : null}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{row.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : loading ? (
          <div className="text-sm text-gray-600">Loading…</div>
        ) : null}
      </div>
    </div>
  )
}
