import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../App';
import { claimsApi, policiesApi } from '../../services/api';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Shield,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAuth();
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [claimsData, policiesData] = await Promise.all([
        claimsApi.getAll({ userId: user?.id }),
        policiesApi.getAll(user?.id)
      ]);

      setClaims(claimsData || []);
      setPolicies(policiesData || []);

      // Calculate stats
      const claimsList = claimsData || [];
      setStats({
        total: claimsList.length,
        pending: claimsList.filter(c => c.status === 'under_review' || c.status === 'processing').length,
        approved: claimsList.filter(c => c.status === 'approved').length,
        rejected: claimsList.filter(c => c.status === 'rejected').length
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="text-green-500" size={18} />;
      case 'rejected': return <XCircle className="text-red-500" size={18} />;
      case 'under_review':
      case 'processing': return <Clock className="text-yellow-500" size={18} />;
      default: return <FileText className="text-gray-500" size={18} />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-primary-100 mt-1">Track your claims and manage your insurance effortlessly.</p>
        <Link
          to="/apply"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors"
        >
          File New Claim <ArrowRight size={18} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Claims" 
          value={stats.total} 
          icon={FileText}
          color="blue"
        />
        <StatCard 
          label="Pending" 
          value={stats.pending} 
          icon={Clock}
          color="yellow"
        />
        <StatCard 
          label="Approved" 
          value={stats.approved} 
          icon={CheckCircle}
          color="green"
        />
        <StatCard 
          label="Rejected" 
          value={stats.rejected} 
          icon={XCircle}
          color="red"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Claims */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Recent Claims</h2>
            <Link to="/claims" className="text-sm text-primary-600 hover:underline">
              View all
            </Link>
          </div>
          
          {claims.length === 0 ? (
            <div className="p-8 text-center">
              <FileText size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No claims yet</p>
              <Link to="/apply" className="text-primary-600 hover:underline text-sm">
                File your first claim
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {claims.slice(0, 4).map((claim) => (
                <Link
                  key={claim.id}
                  to={`/claims/${claim.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    {claim.type === 'health' ? '🏥' : '🚗'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {claim.type === 'health' ? 'Health Claim' : 'Vehicle Claim'}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(claim.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatCurrency(claim.claimAmount)}</p>
                    <div className="flex items-center gap-1 justify-end">
                      {getStatusIcon(claim.status)}
                      <span className="text-xs capitalize">{claim.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active Policies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Your Policies</h2>
          </div>
          
          {policies.length === 0 ? (
            <div className="p-8 text-center">
              <Shield size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No policies found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {policies.filter(p => p.status === 'active').slice(0, 3).map((policy) => (
                <div key={policy.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{policy.type === 'health' ? '🏥' : '🚗'}</span>
                        <p className="font-medium text-gray-900">{policy.provider}</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Policy: {policy.policyNumber}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      policy.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {policy.status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Coverage</span>
                    <span className="font-medium text-gray-900">{formatCurrency(policy.coverageAmount)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Valid till</span>
                    <span className="text-gray-900">{formatDate(policy.endDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-medium text-blue-900">Quick Tip</p>
            <p className="text-sm text-blue-700 mt-1">
              Use our AI assistant to get help with filing claims or understanding your policy coverage. 
              Click the "AI Assistant" button in the top right corner!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
