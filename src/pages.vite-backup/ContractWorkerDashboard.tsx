import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, Clock, DollarSign, MapPin, Package, Truck, Warehouse } from 'lucide-react';

type WorkerType = 'sales_rep' | 'driver' | 'warehouse';
type JobStatus = 'available' | 'accepted' | 'in_progress' | 'completed';

interface Job {
  id: string;
  type: WorkerType;
  title: string;
  description: string;
  location?: string;
  commission: number;
  status: JobStatus;
  createdAt: string;
  deadline?: string;
}

export default function ContractWorkerDashboard() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [workerType, setWorkerType] = useState<WorkerType>('sales_rep');
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
    fetchEarnings();
  }, [workerType, user]);

  async function fetchJobs() {
    try {
      setLoading(true);
      const res = await fetch(`/api/contract-workers/jobs?type=${workerType}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        setAvailableJobs(data.available || []);
        setMyJobs(data.myJobs || []);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEarnings() {
    try {
      const res = await fetch(`/api/contract-workers/earnings`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (res.ok) {
        const data = await res.json();
        setEarnings(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    }
  }

  async function acceptJob(jobId: string) {
    try {
      const res = await fetch(`/api/contract-workers/jobs/${jobId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        await fetchJobs();
      }
    } catch (err) {
      console.error('Failed to accept job:', err);
    }
  }

  async function completeJob(jobId: string) {
    try {
      const res = await fetch(`/api/contract-workers/jobs/${jobId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        await fetchJobs();
        await fetchEarnings();
      }
    } catch (err) {
      console.error('Failed to complete job:', err);
    }
  }

  const getWorkerIcon = (type: WorkerType) => {
    switch (type) {
      case 'sales_rep':
        return Package;
      case 'driver':
        return Truck;
      case 'warehouse':
        return Warehouse;
      default:
        return Package;
    }
  };

  const WorkerIcon = getWorkerIcon(workerType);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                {t('worker.dashboard')}
              </h1>
              <p className="text-sm text-gray-600">{user?.name || 'Worker'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg">
                <DollarSign className="text-emerald-600" size={20} />
                <span className="font-bold text-emerald-600">${earnings.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Worker Type Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-2 mb-6">
          {(['sales_rep', 'driver', 'warehouse'] as WorkerType[]).map((type) => {
            const Icon = getWorkerIcon(type);
            return (
              <button
                key={type}
                onClick={() => setWorkerType(type)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  workerType === type
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span className="capitalize">{type.replace('_', ' ')}</span>
              </button>
            );
          })}
        </div>

        {/* Available Jobs */}
        <div className="mb-8">
          <h2 className="text-xl font-black text-gray-900 mb-4">{t('worker.availableJobs')}</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">{t('common.loading')}</div>
          ) : availableJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No available jobs</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-200 hover:border-emerald-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <WorkerIcon className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </div>
                    </div>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-emerald-600" size={18} />
                      <span className="font-bold text-emerald-600">${job.commission.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={() => acceptJob(job.id)}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                      {t('worker.accept')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Jobs */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-4">{t('worker.myJobs')}</h2>
          {myJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No active jobs</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl shadow-lg p-6 border-2 border-emerald-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 rounded-lg">
                        <WorkerIcon className="text-emerald-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.description}</p>
                      </div>
                    </div>
                    {job.status === 'in_progress' && (
                      <Clock className="text-orange-500" size={20} />
                    )}
                    {job.status === 'completed' && (
                      <CheckCircle className="text-emerald-500" size={20} />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="text-emerald-600" size={18} />
                      <span className="font-bold text-emerald-600">${job.commission.toFixed(2)}</span>
                    </div>
                    {job.status === 'in_progress' && (
                      <button
                        onClick={() => completeJob(job.id)}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                      >
                        {t('worker.complete')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

