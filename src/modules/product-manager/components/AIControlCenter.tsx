import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, RefreshCw, Sparkles, Image as ImageIcon, Zap } from 'lucide-react';

interface ExtractedItem {
  id: string;
  extracted_name: string;
  sku?: string;
  brand_guess?: string;
  category_guess?: string;
  ai_confidence?: number;
  ai_image_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  price?: number;
  quantity?: number;
}

interface AIControlCenterProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  onOpenStatusDrawer: (summaryId: string) => void;
}

export const AIControlCenter: React.FC<AIControlCenterProps> = ({
  onShowToast,
  onOpenStatusDrawer,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedItems, setExtractedItems] = useState<ExtractedItem[]>([]);
  const [summaryId, setSummaryId] = useState<string | null>(null);
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/pdf',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'image/png',
        'image/jpeg',
        'image/jpg'
      ];

      if (validTypes.includes(file.type)) {
        setUploadedFile(file);
      } else {
        onShowToast('Please upload a PDF, CSV, Excel, or Image file', 'error');
      }
    }
  };

  const handleUploadPO = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/auto/ingest-po', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process PO');
      }

      const result = await response.json();
      setExtractedItems(result.items || []);
      setSummaryId(result.summaryId);
      onShowToast(`Successfully extracted ${result.items?.length || 0} items`, 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      onShowToast('Failed to process PO. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleItemAction = async (itemId: string, action: 'match' | 'approve' | 'reject' | 'retry') => {
    try {
      const response = await fetch(`/api/auto/item/${itemId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} item`);
      }

      const result = await response.json();

      // Update local state
      setExtractedItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'processing' }
            : item
        )
      );

      onShowToast(`Item ${action}ed successfully`, 'success');
    } catch (error) {
      console.error(`${action} failed:`, error);
      onShowToast(`Failed to ${action} item`, 'error');
    }
  };

  const handleAutoProcessAll = async () => {
    setIsProcessingBulk(true);
    try {
      const response = await fetch('/api/auto/process-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: extractedItems.map(i => i.id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to auto-process items');
      }

      const result = await response.json();
      onShowToast(`Processing ${result.count} items in background`, 'success');

      if (result.summaryId) {
        onOpenStatusDrawer(result.summaryId);
      }
    } catch (error) {
      console.error('Auto-process failed:', error);
      onShowToast('Failed to auto-process items', 'error');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleApproveAllDrafts = async () => {
    const pendingItems = extractedItems.filter(item => item.status === 'pending');

    try {
      const response = await fetch('/api/auto/approve-all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: pendingItems.map(i => i.id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve all drafts');
      }

      setExtractedItems(prev =>
        prev.map(item => ({ ...item, status: 'approved' }))
      );

      onShowToast(`Approved ${pendingItems.length} drafts`, 'success');
    } catch (error) {
      console.error('Approve all failed:', error);
      onShowToast('Failed to approve all drafts', 'error');
    }
  };

  const handleRunImagePipeline = async () => {
    try {
      const response = await fetch('/api/auto/image-pipeline', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: extractedItems.map(i => i.id) }),
      });

      if (!response.ok) {
        throw new Error('Failed to run image pipeline');
      }

      const result = await response.json();
      onShowToast('Image generation pipeline started', 'success');

      if (result.summaryId) {
        onOpenStatusDrawer(result.summaryId);
      }
    } catch (error) {
      console.error('Image pipeline failed:', error);
      onShowToast('Failed to run image pipeline', 'error');
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-400';
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Rejected</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Processing</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Sparkles size={32} />
          <h2 className="text-2xl font-bold">AI Control Center</h2>
        </div>
        <p className="text-purple-100">
          Upload purchase orders and let AI automatically extract, match, and generate product data
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Purchase Order</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File (PDF, CSV, Excel, or Image)
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex-1 flex items-center justify-center px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-purple-500 transition">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <span className="text-sm text-gray-600">
                    {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, CSV, XLSX, PNG, JPG up to 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {uploadedFile && (
            <div className="flex items-center justify-between bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="text-purple-600" size={20} />
                <span className="text-sm font-medium text-gray-900">{uploadedFile.name}</span>
              </div>
              <button
                onClick={handleUploadPO}
                disabled={isUploading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <Zap size={16} />
                <span>{isUploading ? 'Processing...' : 'Process with AI'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Extracted Items Table */}
      {extractedItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Extracted Items ({extractedItems.length})
              </h3>

              {/* Bulk Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleAutoProcessAll}
                  disabled={isProcessingBulk}
                  className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
                >
                  <Sparkles size={16} />
                  <span>Auto-Process All</span>
                </button>
                <button
                  onClick={handleApproveAllDrafts}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                >
                  <CheckCircle size={16} />
                  <span>Approve All Drafts</span>
                </button>
                <button
                  onClick={handleRunImagePipeline}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                >
                  <ImageIcon size={16} />
                  <span>Run Image Pipeline</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {extractedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {item.ai_image_url ? (
                        <img
                          src={item.ai_image_url}
                          alt={item.extracted_name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="text-gray-400" size={20} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.extracted_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.sku || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.brand_guess || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.category_guess || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-semibold ${getConfidenceColor(item.ai_confidence)}`}>
                        {item.ai_confidence ? `${(item.ai_confidence * 100).toFixed(0)}%` : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleItemAction(item.id, 'match')}
                          disabled={item.status !== 'pending'}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30"
                          title="Match"
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button
                          onClick={() => handleItemAction(item.id, 'approve')}
                          disabled={item.status !== 'pending'}
                          className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-30"
                          title="Approve"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleItemAction(item.id, 'reject')}
                          disabled={item.status !== 'pending'}
                          className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleItemAction(item.id, 'retry')}
                          className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                          title="Retry AI"
                        >
                          <Sparkles size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {extractedItems.length === 0 && !uploadedFile && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Sparkles className="mx-auto text-gray-300 mb-4" size={64} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders Uploaded</h3>
          <p className="text-gray-500">
            Upload a PO to get started with AI-powered product extraction
          </p>
        </div>
      )}
    </div>
  );
};
