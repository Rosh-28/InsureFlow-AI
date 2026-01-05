import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Users
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, claimsData] = await Promise.all([
        claimsApi.getStats(),
        claimsApi.getAll()
      ]);
      setStats(statsData);
      setRecentClaims(claimsData?.slice(0, 5) || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
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
      month: 'short'
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
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon size={12} />
        {status.replace('_', ' ')}
      </span>
    );
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of claims and processing status</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Claims"
          value={stats?.total || 0}
          icon={FileText}
          color="blue"
        />
        <StatCard
          label="Pending Review"
          value={stats?.pending || 0}
          icon={Clock}
          color="yellow"
          highlight
        />
        <StatCard
          label="Approved"
          value={stats?.approved || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          label="Rejected"
          value={stats?.rejected || 0}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">Total Claim Value</h3>
            <TrendingUp size={20} className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats?.totalAmount || 0)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Approved: {formatCurrency(stats?.approvedAmount || 0)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">By Type</h3>
            <FileText size={20} className="text-primary-500" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">🏥 Health</span>
              <span className="font-semibold">{stats?.byType?.health || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">🚗 Vehicle</span>
              <span className="font-semibold">{stats?.byType?.vehicle || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-700">Risk Distribution</h3>
            <AlertTriangle size={20} className="text-yellow-500" />
          </div>
          <div className="space-y-2">
            <RiskBar label="Low" count={stats?.riskDistribution?.low || 0} color="green" />
            <RiskBar label="Medium" count={stats?.riskDistribution?.medium || 0} color="yellow" />
            <RiskBar label="High" count={stats?.riskDistribution?.high || 0} color="red" />
          </div>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Recent Claims</h2>
          <Link 
            to="/admin/claims" 
            className="text-sm text-primary-600 hover:underline flex items-center gap-1"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/admin/claims/${claim.id}`} className="text-primary-600 hover:underline font-medium">
                      {claim.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2">
                      {claim.type === 'health' ? '🏥' : '🚗'}
                      <span className="capitalize">{claim.type}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(claim.claimAmount)}</td>
                  <td className="px-4 py-3">
                    {claim.riskAssessment?.riskLevel && (
                      <span className={`px-2 py-0.5 rounded text-xs font-medium risk-${claim.riskAssessment.riskLevel}`}>
                        {claim.riskAssessment.riskLevel.toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(claim.status)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(claim.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-blue-600" size={20} />
          <div>
            <p className="font-medium text-blue-900">
              {stats?.pending || 0} claims need your attention
            </p>
            <p className="text-sm text-blue-700">
              Review pending claims to ensure timely processing
            </p>
          </div>
          <Link 
            to="/admin/claims?status=under_review" 
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Review Now
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, highlight }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600'
  };

  return (
    <div className={`bg-white rounded-xl border ${highlight ? 'border-yellow-300 ring-2 ring-yellow-100' : 'border-gray-200'} p-4`}>
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function RiskBar({ label, count, color }) {
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-16">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full`} style={{ width: `${Math.min(count * 20, 100)}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
    </div>
  );
}
