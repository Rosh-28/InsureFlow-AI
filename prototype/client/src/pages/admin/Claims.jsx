import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import { 
  Search, 
  Filter,
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  ChevronRight,
  AlertTriangle,
  Download
} from 'lucide-react';

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'processing', label: 'Processing' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

const typeFilters = [
  { value: 'all', label: 'All Types' },
  { value: 'health', label: 'Health' },
  { value: 'vehicle', label: 'Vehicle' }
];

export default function AdminClaims() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadClaims();
  }, [statusFilter, typeFilter]);

  const loadClaims = async () => {
    try {
      setLoading(true);
      const data = await claimsApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined
      });
      setClaims(data || []);
    } catch (error) {
      console.error('Failed to load claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      under_review: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock }
    };
    const c = config[status] || config.processing;
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon size={12} />
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getRiskBadge = (riskLevel) => {
    if (!riskLevel) return null;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium risk-${riskLevel}`}>
        {riskLevel.toUpperCase()}
      </span>
    );
  };

  const filteredClaims = claims.filter(claim => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      claim.id.toLowerCase().includes(searchLower) ||
      claim.userId?.toLowerCase().includes(searchLower) ||
      claim.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Claims</h1>
          <p className="text-gray-500">Manage and review insurance claims</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <Download size={18} />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by claim ID, user, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {statusFilters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {typeFilters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Claims Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No claims found</h3>
          <p className="text-gray-500">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
                          {claim.type === 'health' ? '🏥' : '🚗'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{claim.id}</p>
                          <p className="text-sm text-gray-500 capitalize">{claim.type} Insurance</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-gray-900">{claim.userId}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{formatCurrency(claim.claimAmount)}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getRiskBadge(claim.riskAssessment?.riskLevel)}
                        {claim.riskAssessment?.riskLevel === 'high' && (
                          <AlertTriangle size={14} className="text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {formatDate(claim.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        to={`/admin/claims/${claim.id}`}
                        className="flex items-center gap-1 text-primary-600 hover:underline"
                      >
                        Review
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination placeholder */}
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredClaims.length} of {claims.length} claims
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
