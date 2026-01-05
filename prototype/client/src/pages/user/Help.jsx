import { useState, useEffect } from 'react';
import { chatApi } from '../../services/api';
import { 
  Search, 
  MessageCircle, 
  FileText, 
  Clock, 
  Shield,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';

const faqCategories = [
  {
    id: 'filing',
    title: 'Filing Claims',
    icon: FileText,
    questions: [
      {
        q: 'How do I file a new insurance claim?',
        a: 'To file a claim, go to "Apply Claim" from your dashboard. Select your insurance type (Health or Vehicle), enter your policy details or scan your policy document, upload required supporting documents, fill in the claim amount and description, then review and submit.'
      },
      {
        q: 'What documents do I need for a health insurance claim?',
        a: 'For health insurance claims, you typically need: Hospital bills/invoices (required), Discharge summary (required), Doctor\'s prescription (required), Lab/diagnostic reports (if applicable), and Pharmacy bills (if applicable).'
      },
      {
        q: 'What documents do I need for a vehicle insurance claim?',
        a: 'For vehicle insurance claims, you need: FIR copy (for accidents/theft), Repair estimate from authorized service center, Photos of damage, Driving license copy, and Vehicle RC copy.'
      }
    ]
  },
  {
    id: 'status',
    title: 'Claim Status',
    icon: Clock,
    questions: [
      {
        q: 'How long does claim processing take?',
        a: 'Typical processing times: Initial review: 1-2 business days, Document verification: 2-3 business days, Final decision: 5-7 business days. Simple claims may be processed faster, while complex claims may take longer.'
      },
      {
        q: 'What do the different claim statuses mean?',
        a: 'Processing: Your claim is being analyzed by our AI system. Under Review: Your claim is being reviewed by our team. Approved: Your claim has been approved for payment. Rejected: Your claim was not approved (you can see the reason in details).'
      },
      {
        q: 'Can I track my claim in real-time?',
        a: 'Yes! Go to "My Claims" to see all your claims and their current status. Click on any claim to see the detailed timeline of all status changes.'
      }
    ]
  },
  {
    id: 'policy',
    title: 'Policy & Coverage',
    icon: Shield,
    questions: [
      {
        q: 'How can I check what my policy covers?',
        a: 'You can view your policy details on the Dashboard under "Your Policies". Each policy shows the coverage amount, type, and status. For detailed coverage information, contact our support team.'
      },
      {
        q: 'What if my claim amount exceeds my coverage?',
        a: 'If your claim amount exceeds your policy coverage limit, only the maximum covered amount will be considered. The excess amount will not be covered under the claim.'
      },
      {
        q: 'Can I file multiple claims on the same policy?',
        a: 'Yes, you can file multiple claims as long as you haven\'t exceeded your annual coverage limit. Each claim is processed independently.'
      }
    ]
  }
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState('filing');
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [quickQuestions, setQuickQuestions] = useState([]);

  useEffect(() => {
    loadQuickQuestions();
  }, []);

  const loadQuickQuestions = async () => {
    try {
      const data = await chatApi.getQuickQuestions();
      setQuickQuestions(data || []);
    } catch (err) {
      console.error('Failed to load quick questions:', err);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const toggleQuestion = (questionIndex) => {
    setExpandedQuestion(expandedQuestion === questionIndex ? null : questionIndex);
  };

  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
        <p className="text-gray-500 mt-1">Find answers to common questions about insurance claims</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search for help..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* AI Assistant Promo */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageCircle size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Need personalized help?</h3>
            <p className="text-primary-100 mt-1">
              Our AI assistant can answer your specific questions, guide you through filing claims, 
              and help you understand your policy coverage.
            </p>
            <p className="text-sm text-primary-200 mt-3">
              Click the "AI Assistant" button in the top right corner to start chatting.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      {quickQuestions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Popular Questions</h2>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q) => (
              <button
                key={q.id}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
              >
                {q.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FAQ Categories */}
      <div className="space-y-4">
        {(searchQuery ? filteredCategories : faqCategories).map((category) => {
          const Icon = category.icon;
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Icon size={20} className="text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">{category.title}</span>
                </div>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  {category.questions.map((item, idx) => {
                    const questionKey = `${category.id}-${idx}`;
                    const isQuestionExpanded = expandedQuestion === questionKey;

                    return (
                      <div key={idx} className="border-b border-gray-100 last:border-b-0">
                        <button
                          onClick={() => toggleQuestion(questionKey)}
                          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-700 pr-4">{item.q}</span>
                          {isQuestionExpanded ? (
                            <ChevronUp size={18} className="flex-shrink-0 text-gray-400" />
                          ) : (
                            <ChevronDown size={18} className="flex-shrink-0 text-gray-400" />
                          )}
                        </button>
                        {isQuestionExpanded && (
                          <div className="px-4 pb-4">
                            <p className="text-gray-600 leading-relaxed">{item.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Support */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Still need help?</h3>
        <p className="text-gray-600 mb-4">
          If you couldn't find the answer you're looking for, our support team is here to help.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href="mailto:support@insureco.com"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Email Support
            <ExternalLink size={16} />
          </a>
          <a
            href="tel:+911800123456"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Call: 1800-123-456
          </a>
        </div>
      </div>
    </div>
  );
}
