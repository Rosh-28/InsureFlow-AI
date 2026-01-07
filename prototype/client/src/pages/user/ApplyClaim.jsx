import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { claimsApi, policiesApi } from '../../services/api';
import { 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  FileText, 
  X, 
  Check,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  Keyboard,
  Mic,
  MicOff
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Select Type' },
  { id: 2, title: 'Policy Details' },
  { id: 3, title: 'Upload Documents' },
  { id: 4, title: 'Claim Details' },
  { id: 5, title: 'Review & Submit' }
];

export default function ApplyClaim() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [claimType, setClaimType] = useState('');
  const [policyInputMode, setPolicyInputMode] = useState('ocr'); // 'ocr' or 'manual'
  const [policyNumber, setPolicyNumber] = useState('');
  const [policyData, setPolicyData] = useState(null);
  const [policyFile, setPolicyFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [requirements, setRequirements] = useState(null);
  const [claimAmount, setClaimAmount] = useState('');
  const [description, setDescription] = useState('');

  // Speech-to-text state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in your browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-IN';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setDescription(prev => prev + finalTranscript);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Load document requirements when type is selected
  const loadRequirements = async (type) => {
    try {
      const data = await policiesApi.getRequirements(type);
      setRequirements(data);
    } catch (err) {
      console.error('Failed to load requirements:', err);
    }
  };

  const handleTypeSelect = (type) => {
    setClaimType(type);
    loadRequirements(type);
  };

  // OCR Processing
  const handlePolicyFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPolicyFile(file);
    setOcrLoading(true);
    setError('');

    try {
      const result = await policiesApi.ocr(file);
      setOcrResult(result);
      
      if (result.extracted) {
        setPolicyData(result.extracted);
        if (result.extracted.policyNumber) {
          setPolicyNumber(result.extracted.policyNumber);
        }
      }
    } catch (err) {
      setError('Failed to process document. Please try again or enter details manually.');
    } finally {
      setOcrLoading(false);
    }
  };

  // Validate policy number
  const validatePolicy = async () => {
    if (!policyNumber.trim()) {
      setError('Please enter a policy number');
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const result = await policiesApi.validate(policyNumber);
      
      if (!result.isValid) {
        setError(result.message || 'Invalid policy number');
        return false;
      }

      setPolicyData(result.policy);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to validate policy');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Document upload
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setDocuments(prev => [...prev, ...newDocs]);
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Navigation
  const nextStep = async () => {
    setError('');

    if (currentStep === 1 && !claimType) {
      setError('Please select a claim type');
      return;
    }

    if (currentStep === 2) {
      if (policyInputMode === 'manual') {
        const valid = await validatePolicy();
        if (!valid) return;
      } else if (!policyData) {
        setError('Please upload and verify your policy document');
        return;
      }
    }

    if (currentStep === 4) {
      if (!claimAmount || parseFloat(claimAmount) <= 0) {
        setError('Please enter a valid claim amount');
        return;
      }
    }

    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Submit claim
  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('policyId', policyData?.id || policyNumber);
      formData.append('type', claimType);
      formData.append('description', description);
      formData.append('claimAmount', claimAmount);
      formData.append('policyData', JSON.stringify(policyData));

      documents.forEach(doc => {
        formData.append('documents', doc.file);
      });

      const result = await claimsApi.create(formData);
      
      // Navigate to success/claim detail
      navigate(`/claims/${result.id}`, { 
        state: { success: true, message: 'Claim submitted successfully!' }
      });
    } catch (err) {
      setError(err.message || 'Failed to submit claim');
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

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">File a New Claim</h1>
      <p className="text-gray-500 mb-6">Complete the form below to submit your insurance claim</p>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
                ${currentStep > step.id 
                  ? 'bg-green-500 text-white' 
                  : currentStep === step.id 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-500'}
              `}>
                {currentStep > step.id ? <Check size={16} /> : step.id}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`w-12 sm:w-24 h-1 mx-2 ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {STEPS.map((step) => (
            <span key={step.id} className="text-xs text-gray-500 hidden sm:block">
              {step.title}
            </span>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {/* Step 1: Select Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Select Insurance Type</h2>
            <p className="text-gray-500">What type of insurance claim would you like to file?</p>
            
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => handleTypeSelect('health')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  claimType === 'health'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-4xl">🏥</span>
                <h3 className="font-semibold text-gray-900 mt-3">Health Insurance</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Hospital bills, medical treatments, prescriptions
                </p>
              </button>

              <button
                onClick={() => handleTypeSelect('vehicle')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  claimType === 'vehicle'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-4xl">🚗</span>
                <h3 className="font-semibold text-gray-900 mt-3">Vehicle Insurance</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Accidents, theft, damage repairs
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Policy Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Policy Details</h2>
            
            {/* Input Mode Toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setPolicyInputMode('ocr')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
                  policyInputMode === 'ocr' 
                    ? 'bg-white shadow text-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                <Camera size={18} />
                Scan Document
              </button>
              <button
                onClick={() => setPolicyInputMode('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
                  policyInputMode === 'manual' 
                    ? 'bg-white shadow text-primary-600' 
                    : 'text-gray-600'
                }`}
              >
                <Keyboard size={18} />
                Enter Manually
              </button>
            </div>

            {policyInputMode === 'ocr' ? (
              <div className="space-y-4">
                <p className="text-gray-500">
                  Upload your policy document and we'll extract the details automatically
                </p>
                
                <div
                  onClick={() => !ocrLoading && document.getElementById('policy-upload').click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    ocrLoading ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-primary-400'
                  }`}
                >
                  <input
                    id="policy-upload"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handlePolicyFileUpload}
                    className="hidden"
                    disabled={ocrLoading}
                  />
                  
                  {ocrLoading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 size={40} className="text-primary-600 animate-spin mb-3" />
                      <p className="text-gray-600">Processing document...</p>
                      <p className="text-sm text-gray-400">This may take a few seconds</p>
                    </div>
                  ) : policyFile ? (
                    <div className="flex flex-col items-center">
                      <CheckCircle size={40} className="text-green-500 mb-3" />
                      <p className="text-gray-900 font-medium">{policyFile.name}</p>
                      <p className="text-sm text-green-600 mt-1">Document processed successfully</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-sm text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                    </>
                  )}
                </div>

                {ocrResult?.extracted && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Extracted Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(ocrResult.extracted).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                          <span className="text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    value={policyNumber}
                    onChange={(e) => setPolicyNumber(e.target.value)}
                    placeholder="e.g., HLTH-2024-78901"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {policyData && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={18} className="text-green-600" />
                      <span className="font-medium text-green-800">Policy Verified</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Holder: </span>
                        <span className="text-gray-900">{policyData.holderName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Coverage: </span>
                        <span className="text-gray-900">{formatCurrency(policyData.coverageAmount)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Upload Documents */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Upload Supporting Documents</h2>
            
            {requirements && (
              <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                <h4 className="font-medium text-primary-800 mb-2">Required Documents</h4>
                <ul className="text-sm text-primary-700 space-y-1">
                  {requirements.required?.map((doc) => (
                    <li key={doc.id} className="flex items-center gap-2">
                      <FileText size={14} />
                      {doc.name} - {doc.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleDocumentUpload}
                className="hidden"
                multiple
              />
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Click to upload documents</p>
              <p className="text-sm text-gray-400 mt-1">PNG, JPG, PDF up to 10MB each</p>
            </div>

            {documents.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Uploaded Documents ({documents.length})</h4>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText size={20} className="text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Claim Details */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Claim Details</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Claim Amount (₹)
              </label>
              <input
                type="number"
                value={claimAmount}
                onChange={(e) => setClaimAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {policyData?.coverageAmount && (
                <p className="text-sm text-gray-500 mt-1">
                  Max coverage: {formatCurrency(policyData.coverageAmount)}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isListening 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff size={16} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic size={16} />
                      Speak
                    </>
                  )}
                </button>
              </div>
              {isListening && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-red-700">Listening... Speak now</span>
                </div>
              )}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the reason for your claim... or click 'Speak' to use voice input"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  isListening ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Review Your Claim</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Claim Type</h4>
                <p className="text-lg font-medium text-gray-900">
                  {claimType === 'health' ? '🏥 Health Insurance' : '🚗 Vehicle Insurance'}
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Policy</h4>
                <p className="font-medium text-gray-900">{policyData?.policyNumber || policyNumber}</p>
                <p className="text-sm text-gray-600">{policyData?.holderName}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Claim Amount</h4>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(claimAmount)}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Documents</h4>
                <p className="text-gray-900">{documents.length} document(s) attached</p>
              </div>

              {description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                  <p className="text-gray-900">{description}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ By submitting this claim, you confirm that all information provided is accurate and complete. 
                False claims may result in policy termination.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          {currentStep < 5 ? (
            <button
              onClick={nextStep}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Next
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Submit Claim
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
