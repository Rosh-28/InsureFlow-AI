import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../App';
import { claimsApi } from '../../services/api';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const statusFilters = [
  { value: 'all', label: 'All Claims' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export default function StatusTracker() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClaims();
  }, [user, filter]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await claimsApi.getAll({ 
        userId: user?.id,
        status: filter !== 'all' ? filter : undefined
      });
      setClaims(data || []);
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600', 
          bg: 'bg-green-100',
          label: 'Approved'
        };
      case 'rejected':
        return { 
          icon: XCircle, 
          color: 'text-red-600', 
          bg: 'bg-red-100',
          label: 'Rejected'
        };
      case 'under_review':
        return { 
          icon: Clock, 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-100',
          label: 'Under Review'
        };
      case 'processing':
        return { 
          icon: Clock, 
          color: 'text-primary-600', 
          bg: 'bg-primary-100',
          label: 'Processing'
        };
      default:
        return { 
          icon: FileText, 
          color: 'text-gray-600', 
          bg: 'bg-gray-100',
          label: status
        };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const filteredClaims = claims.filter(claim => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      claim.id.toLowerCase().includes(searchLower) ||
      claim.type.toLowerCase().includes(searchLower) ||
      claim.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
        <p className="text-gray-500 mt-1">Track the status of all your insurance claims</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by claim ID or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filter === f.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Claims List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
          <p className="text-gray-500 mb-4">
            {filter !== 'all' 
              ? `You don't have any ${filter.replace('_', ' ')} claims.`
              : "You haven't filed any claims yet."}
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            File a Claim
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClaims.map((claim) => {
            const status = getStatusConfig(claim.status);
            const StatusIcon = status.icon;

            return (
              <Link
                key={claim.id}
                to={`/claims/${claim.id}`}
                className="block bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                        {claim.type === 'health' ? '🏥' : '🚗'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {claim.type === 'health' ? 'Health Insurance Claim' : 'Vehicle Insurance Claim'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {claim.id} • Filed on {formatDate(claim.createdAt)}
                        </p>
                        {claim.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {claim.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${status.bg}`}>
                        <StatusIcon size={14} className={status.color} />
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      {claim.riskAssessment?.riskLevel && (
                        <div className={`px-2 py-0.5 rounded text-xs font-medium risk-${claim.riskAssessment.riskLevel}`}>
                          {claim.riskAssessment.riskLevel.toUpperCase()} RISK
                        </div>
                      )}
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(claim.claimAmount)}
                    </p>
                  </div>
                </div>

                {/* Status Timeline Preview */}
                {claim.statusHistory && claim.statusHistory.length > 0 && (
                  <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>
                        Last updated: {formatDate(claim.statusHistory[claim.statusHistory.length - 1].timestamp)}
                      </span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
