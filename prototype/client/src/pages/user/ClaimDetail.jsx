import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { claimsApi } from '../../services/api';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  Download,
  AlertTriangle,
  Shield
} from 'lucide-react';

export default function ClaimDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Approved' };
      case 'rejected':
        return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Rejected' };
      case 'under_review':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Under Review' };
      case 'processing':
        return { icon: Clock, color: 'text-primary-600', bg: 'bg-primary-100', label: 'Processing' };
      case 'submitted':
        return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Submitted' };
      default:
        return { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', label: status };
    }
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

  if (error || !claim) {
    return (
      <div className="text-center py-12">
        <XCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Claim Not Found</h2>
        <p className="text-gray-500 mb-4">{error || 'The claim you are looking for does not exist.'}</p>
        <Link to="/claims" className="text-primary-600 hover:underline">
          Back to My Claims
        </Link>
      </div>
    );
  }

  const currentStatus = getStatusConfig(claim.status);
  const StatusIcon = currentStatus.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-3xl">
              {claim.type === 'health' ? '🏥' : '🚗'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {claim.type === 'health' ? 'Health Insurance Claim' : 'Vehicle Insurance Claim'}
              </h1>
              <p className="text-gray-500 mt-1">{claim.id}</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${currentStatus.bg}`}>
            <StatusIcon size={18} className={currentStatus.color} />
            <span className={`font-medium ${currentStatus.color}`}>{currentStatus.label}</span>
          </div>
        </div>

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Claim Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(claim.claimAmount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Filed On</p>
            <p className="font-medium text-gray-900">{formatDate(claim.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Policy ID</p>
            <p className="font-medium text-gray-900">{claim.policyId || 'N/A'}</p>
          </div>
        </div>

        {claim.description && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Description</p>
            <p className="text-gray-900">{claim.description}</p>
          </div>
        )}
      </div>

      {/* AI Assessment */}
      {(claim.verification || claim.riskAssessment) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-primary-600" />
            AI Assessment
          </h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Document Verification */}
            {claim.verification && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Document Verification</h3>
                <div className="flex items-center gap-2 mb-2">
                  {claim.verification.isValid ? (
                    <CheckCircle size={18} className="text-green-600" />
                  ) : (
                    <AlertTriangle size={18} className="text-yellow-600" />
                  )}
                  <span className={claim.verification.isValid ? 'text-green-700' : 'text-yellow-700'}>
                    {claim.verification.isValid ? 'Documents Verified' : 'Review Required'}
                  </span>
                </div>
                {claim.verification.confidence && (
                  <p className="text-sm text-gray-600">
                    Confidence: {claim.verification.confidence}%
                  </p>
                )}
                {claim.verification.missingDocuments?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-red-600">Missing documents:</p>
                    <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                      {claim.verification.missingDocuments.map((doc, i) => (
                        <li key={i}>{doc.name || doc}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Risk Assessment */}
            {claim.riskAssessment && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Risk Assessment</h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium risk-${claim.riskAssessment.riskLevel}`}>
                    {claim.riskAssessment.riskLevel?.toUpperCase()} RISK
                  </div>
                  <span className="text-gray-600">Score: {claim.riskAssessment.riskScore}/10</span>
                </div>
                {claim.riskAssessment.reasoning && (
                  <p className="text-sm text-gray-600 mt-2">{claim.riskAssessment.reasoning}</p>
                )}
              </div>
            )}
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

      {/* Documents */}
      {claim.documents?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Uploaded Documents</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {claim.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <FileText size={24} className="text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{doc.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {(doc.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <a
                  href={doc.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-primary-600"
                >
                  <Download size={18} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
