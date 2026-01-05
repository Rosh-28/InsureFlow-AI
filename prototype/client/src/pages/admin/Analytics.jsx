import { useState, useEffect } from 'react';
import { claimsApi } from '../../services/api';
import { 
  TrendingUp, 
  TrendingDown,
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  PieChart,
  BarChart3,
  Calendar
} from 'lucide-react';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [claims, setClaims] = useState([]);
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
      setClaims(claimsData || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
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

  // Calculate additional metrics
  const calculateMetrics = () => {
    if (!claims.length) return {};

    const approvedClaims = claims.filter(c => c.status === 'approved');
    const rejectedClaims = claims.filter(c => c.status === 'rejected');
    
    const approvalRate = claims.length > 0 
      ? ((approvedClaims.length / claims.length) * 100).toFixed(1)
      : 0;

    const avgClaimAmount = claims.length > 0
      ? claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0) / claims.length
      : 0;

    const avgApprovedAmount = approvedClaims.length > 0
      ? approvedClaims.reduce((sum, c) => sum + (c.claimAmount || 0), 0) / approvedClaims.length
      : 0;

    // Claims by month (last 6 months simulation)
    const monthlyData = [
      { month: 'Jul', claims: 12, approved: 8 },
      { month: 'Aug', claims: 18, approved: 14 },
      { month: 'Sep', claims: 15, approved: 11 },
      { month: 'Oct', claims: 22, approved: 17 },
      { month: 'Nov', claims: 19, approved: 15 },
      { month: 'Dec', claims: claims.length, approved: approvedClaims.length }
    ];

    return {
      approvalRate,
      avgClaimAmount,
      avgApprovedAmount,
      monthlyData
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Insights and trends for insurance claims</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Claims"
          value={stats?.total || 0}
          icon={FileText}
          trend="+12%"
          trendUp={true}
        />
        <MetricCard
          label="Approval Rate"
          value={`${metrics.approvalRate}%`}
          icon={CheckCircle}
          trend="+5%"
          trendUp={true}
        />
        <MetricCard
          label="Avg Claim Value"
          value={formatCurrency(metrics.avgClaimAmount || 0)}
          icon={TrendingUp}
          trend="-3%"
          trendUp={false}
        />
        <MetricCard
          label="Pending Claims"
          value={stats?.pending || 0}
          icon={Clock}
          trend="2"
          trendUp={null}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Claims by Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart size={18} className="text-primary-600" />
            Claims by Status
          </h2>
          
          <div className="space-y-4">
            <StatusBar 
              label="Approved" 
              count={stats?.approved || 0} 
              total={stats?.total || 1} 
              color="green" 
            />
            <StatusBar 
              label="Pending Review" 
              count={stats?.pending || 0} 
              total={stats?.total || 1} 
              color="yellow" 
            />
            <StatusBar 
              label="Rejected" 
              count={stats?.rejected || 0} 
              total={stats?.total || 1} 
              color="red" 
            />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats?.approved || 0}</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              <p className="text-xs text-gray-500">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats?.rejected || 0}</p>
              <p className="text-xs text-gray-500">Rejected</p>
            </div>
          </div>
        </div>

        {/* Claims by Type */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary-600" />
            Claims by Type
          </h2>
          
          <div className="flex items-end justify-center gap-8 h-48">
            <div className="text-center">
              <div 
                className="w-20 bg-blue-500 rounded-t-lg mx-auto"
                style={{ height: `${Math.max((stats?.byType?.health || 0) * 30, 20)}px` }}
              />
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stats?.byType?.health || 0}</p>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  🏥 Health
                </p>
              </div>
            </div>
            
            <div className="text-center">
              <div 
                className="w-20 bg-purple-500 rounded-t-lg mx-auto"
                style={{ height: `${Math.max((stats?.byType?.vehicle || 0) * 30, 20)}px` }}
              />
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stats?.byType?.vehicle || 0}</p>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  🚗 Vehicle
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Risk Distribution</h2>
          
          <div className="space-y-4">
            <RiskBar 
              label="Low Risk" 
              count={stats?.riskDistribution?.low || 0} 
              color="green"
              description="Auto-approvable claims"
            />
            <RiskBar 
              label="Medium Risk" 
              count={stats?.riskDistribution?.medium || 0} 
              color="yellow"
              description="Requires standard review"
            />
            <RiskBar 
              label="High Risk" 
              count={stats?.riskDistribution?.high || 0} 
              color="red"
              description="Needs detailed investigation"
            />
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-primary-600" />
            Monthly Trend
          </h2>
          
          <div className="flex items-end justify-between h-40 px-2">
            {metrics.monthlyData?.map((data, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div className="flex flex-col-reverse gap-1">
                  <div 
                    className="w-8 bg-primary-200 rounded-t"
                    style={{ height: `${data.claims * 5}px` }}
                  />
                  <div 
                    className="w-8 bg-primary-600 rounded-t"
                    style={{ height: `${data.approved * 5}px` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-600 rounded" />
              <span className="text-gray-600">Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-200 rounded" />
              <span className="text-gray-600">Total</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Financial Summary</h2>
        
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Total Claim Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalAmount || 0)}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Approved Value</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(stats?.approvedAmount || 0)}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Avg Approved Claim</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(metrics.avgApprovedAmount || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, trend, trendUp }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
          <Icon size={20} className="text-primary-600" />
        </div>
        {trend && trendUp !== null && (
          <div className={`flex items-center gap-1 text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function StatusBar({ label, count, total, color }) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  const colors = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function RiskBar({ label, count, color, description }) {
  const colors = {
    green: 'bg-green-500 text-green-700',
    yellow: 'bg-yellow-500 text-yellow-700',
    red: 'bg-red-500 text-red-700'
  };
  const bgColors = {
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50'
  };

  return (
    <div className={`p-3 rounded-lg ${bgColors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-medium ${colors[color].split(' ')[1]}`}>{label}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className={`w-10 h-10 rounded-full ${colors[color].split(' ')[0]} flex items-center justify-center text-white font-bold`}>
          {count}
        </div>
      </div>
    </div>
  );
}
