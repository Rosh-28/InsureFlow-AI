import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { claimsApi, getServerUrl } from '../../services/api';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Download,
  AlertTriangle,
  Shield,
  User,
  MessageSquare,
  Loader2
} from 'lucide-react';

export default function AdminClaimReview() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadClaim();
  }, [id]);

  const loadClaim = async () => {
    try {
      const data = await claimsApi.getById(id);
      setClaim(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      const updated = await claimsApi.updateStatus(id, newStatus, note, user.id);
      setClaim(updated);
      setNote('');
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
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
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' },
      rejected: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' },
      under_review: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Under Review' },
      processing: { icon: Clock, color: 'text-primary-600', bg: 'bg-primary-100', label: 'Processing' },
      submitted: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Submitted' }
    };
    return configs[status] || configs.processing;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="text-center py-12">
        <XCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Claim Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The claim you are looking for does not exist.'}</p>
        <button onClick={() => navigate(-1)} className="text-primary-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const currentStatus = getStatusConfig(claim.status);
  const StatusIcon = currentStatus.icon;
  const canTakeAction = claim.status === 'under_review' || claim.status === 'processing';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={18} />
          Back to Claims
        </button>

        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStatus.bg}`}>
          <StatusIcon size={18} className={currentStatus.color} />
          <span className={`font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Overview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
                {claim.type === 'health' ? '🏥' : '🚗'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{claim.id}</h1>
                <p className="text-gray-500 capitalize">{claim.type} Insurance Claim</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Claim Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(claim.claimAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Filed On</p>
                <p className="font-medium text-gray-900">{formatDate(claim.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-medium text-gray-900">{claim.userId}</p>
              </div>
            </div>

            {claim.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <p className="text-gray-900">{claim.description}</p>
              </div>
            )}
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield size={18} className="text-primary-600" />
              AI Analysis
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Document Verification */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Document Verification</h3>
                
                {claim.verification ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      {claim.verification.isValid ? (
                        <CheckCircle size={18} className="text-green-600" />
                      ) : (
                        <AlertTriangle size={18} className="text-yellow-600" />
                      )}
                      <span className={claim.verification.isValid ? 'text-green-700 font-medium' : 'text-yellow-700 font-medium'}>
                        {claim.verification.isValid ? 'All Documents Valid' : 'Issues Found'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Confidence: <span className={`font-medium ${
                        claim.verification.confidence >= 80 ? 'text-green-600' :
                        claim.verification.confidence >= 50 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {claim.verification.confidence !== undefined && claim.verification.confidence !== null ? claim.verification.confidence : 0}%
                      </span>
                    </p>
                    {claim.verification.issues?.length > 0 && (
                      <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                        {claim.verification.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No verification data available</p>
                )}
              </div>

              {/* Risk Assessment */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Risk Assessment</h3>
                
                {claim.riskAssessment ? (
                  <>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium risk-${claim.riskAssessment.riskLevel}`}>
                        {claim.riskAssessment.riskLevel?.toUpperCase()} RISK
                      </div>
                      <span className="text-gray-600">Score: {claim.riskAssessment.riskScore}/10</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Recommendation: <span className="font-medium capitalize">{claim.riskAssessment.recommendation}</span>
                    </p>
                    {claim.riskAssessment.reasoning && (
                      <p className="text-sm text-gray-500 mt-2">{claim.riskAssessment.reasoning}</p>
                    )}
                    {claim.riskAssessment.flaggedIssues?.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 rounded">
                        <p className="text-sm font-medium text-red-800">Flagged Issues:</p>
                        <ul className="text-sm text-red-700 list-disc list-inside">
                          {claim.riskAssessment.flaggedIssues.map((issue, i) => (
                            <li key={i}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No risk assessment available</p>
                )}
              </div>
            </div>
          </div>

          {/* Documents */}
          {claim.documents?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {claim.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText size={24} className="text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.originalName}</p>
                      <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <a
                      href={`${getServerUrl()}${doc.path}`}
                      download={doc.originalName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded"
                      title="Download document"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Timeline */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Status Timeline</h2>
            
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-6">
                {claim.statusHistory?.map((entry, index) => {
                  const status = getStatusConfig(entry.status);
                  const EntryIcon = status.icon;
                  const isLatest = index === claim.statusHistory.length - 1;

                  return (
                    <div key={index} className="relative flex gap-4 pl-10">
                      <div className={`absolute left-2 w-5 h-5 rounded-full flex items-center justify-center ${
                        isLatest ? status.bg : 'bg-gray-100'
                      }`}>
                        <EntryIcon size={12} className={isLatest ? status.color : 'text-gray-400'} />
                      </div>
                      <div>
                        <p className={`font-medium ${isLatest ? 'text-gray-900' : 'text-gray-600'}`}>
                          {status.label}
                        </p>
                        <p className="text-sm text-gray-500">{entry.note}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(entry.timestamp)}</p>
                        {entry.by && <p className="text-xs text-gray-400">by {entry.by}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Quick Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Policy ID</span>
                <span className="font-medium">{claim.policyId || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="font-medium capitalize">{claim.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Documents</span>
                <span className="font-medium">{claim.documents?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Take Action */}
          {canTakeAction && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Take Action</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Note (Optional)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Add a note about your decision..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                <button
                  onClick={() => handleStatusChange('approved')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  Approve Claim
                </button>

                <button
                  onClick={() => handleStatusChange('rejected')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                  Reject Claim
                </button>
              </div>
            </div>
          )}

          {/* Already Processed */}
          {!canTakeAction && (
            <div className={`rounded-xl border p-6 ${
              claim.status === 'approved' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {claim.status === 'approved' ? (
                  <CheckCircle size={24} className="text-green-600" />
                ) : (
                  <XCircle size={24} className="text-red-600" />
                )}
                <div>
                  <p className={`font-medium ${
                    claim.status === 'approved' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Claim {claim.status === 'approved' ? 'Approved' : 'Rejected'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {claim.reviewedBy && `by ${claim.reviewedBy}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
