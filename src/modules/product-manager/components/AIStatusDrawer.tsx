import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, Loader } from 'lucide-react';

interface PipelineStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp?: string;
  message?: string;
  errorDetails?: string;
}

interface PipelineSummary {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  steps: PipelineStep[];
  startedAt?: string;
  completedAt?: string;
  errors?: string[];
  warnings?: string[];
}

interface AIStatusDrawerProps {
  summaryId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onRetryFailed?: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export const AIStatusDrawer: React.FC<AIStatusDrawerProps> = ({
  summaryId,
  isOpen,
  onClose,
  onRetryFailed,
  onShowToast,
}) => {
  const [summary, setSummary] = useState<PipelineSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (isOpen && summaryId) {
      fetchSummary();
      // Poll for updates every 3 seconds while processing
      const interval = setInterval(() => {
        if (summary?.status === 'processing' || summary?.status === 'pending') {
          fetchSummary();
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOpen, summaryId, summary?.status]);

  const fetchSummary = async () => {
    if (!summaryId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/auto/summary/${summaryId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      onShowToast('Failed to load pipeline status', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryFailed = async () => {
    if (!summaryId) return;

    setIsRetrying(true);
    try {
      const response = await fetch(`/api/auto/retry-failed/${summaryId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to retry items');
      }

      onShowToast('Retrying failed items...', 'success');
      fetchSummary();
      if (onRetryFailed) {
        onRetryFailed();
      }
    } catch (error) {
      console.error('Retry failed:', error);
      onShowToast('Failed to retry items', 'error');
    } finally {
      setIsRetrying(false);
    }
  };

  const getStepIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      case 'processing':
        return <Loader className="text-blue-600 animate-spin" size={20} />;
      case 'pending':
        return <Clock className="text-gray-400" size={20} />;
    }
  };

  const getStatusBadge = (status: PipelineSummary['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Completed</span>;
      case 'failed':
        return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Failed</span>;
      case 'processing':
        return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">Processing</span>;
      case 'partial':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">Partial Success</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">Pending</span>;
    }
  };

  const calculateProgress = () => {
    if (!summary) return 0;
    return summary.totalItems > 0 ? (summary.processedItems / summary.totalItems) * 100 : 0;
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Pipeline Status</h2>
            <p className="text-sm text-gray-500 mt-1">Summary ID: {summaryId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isLoading && !summary ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin text-blue-600" size={48} />
            </div>
          ) : summary ? (
            <>
              {/* Status Overview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Overall Status</span>
                  {getStatusBadge(summary.status)}
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{summary.processedItems} / {summary.totalItems} items</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {calculateProgress().toFixed(0)}% complete
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{summary.successfulItems}</div>
                    <div className="text-xs text-gray-600">Success</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{summary.failedItems}</div>
                    <div className="text-xs text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {summary.totalItems - summary.processedItems}
                    </div>
                    <div className="text-xs text-gray-600">Remaining</div>
                  </div>
                </div>

                {/* Timestamps */}
                {(summary.startedAt || summary.completedAt) && (
                  <div className="mt-4 pt-4 border-t border-gray-300 text-xs text-gray-600 space-y-1">
                    {summary.startedAt && (
                      <div className="flex justify-between">
                        <span>Started:</span>
                        <span className="font-medium">{formatTimestamp(summary.startedAt)}</span>
                      </div>
                    )}
                    {summary.completedAt && (
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-medium">{formatTimestamp(summary.completedAt)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pipeline Steps */}
              {summary.steps && summary.steps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pipeline Steps</h3>
                  <div className="space-y-3">
                    {summary.steps.map((step, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="mt-0.5">{getStepIcon(step.status)}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{step.step}</h4>
                              {step.timestamp && (
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(step.timestamp)}
                                </span>
                              )}
                            </div>
                            {step.message && (
                              <p className="text-sm text-gray-600 mt-1">{step.message}</p>
                            )}
                            {step.errorDetails && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                                {step.errorDetails}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {summary.errors && summary.errors.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <XCircle className="text-red-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">Errors</h3>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                    {summary.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {summary.warnings && summary.warnings.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="text-yellow-600" size={20} />
                    <h3 className="text-lg font-semibold text-gray-900">Warnings</h3>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                    {summary.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-700">
                        • {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={fetchSummary}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>

                {summary.failedItems > 0 && (
                  <button
                    onClick={handleRetryFailed}
                    disabled={isRetrying}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    <RefreshCw size={18} className={isRetrying ? 'animate-spin' : ''} />
                    <span>{isRetrying ? 'Retrying...' : 'Retry Failed Items'}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto text-gray-300 mb-4" size={64} />
              <p className="text-gray-500">No pipeline data available</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
