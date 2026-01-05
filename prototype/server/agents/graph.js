import { StateGraph, END } from '@langchain/langgraph';
import { verifyDocuments } from './documentVerifier.js';
import { assessClaimRisk } from './riskDetector.js';
import { readData } from '../data/dataStore.js';

// Define the state schema
const createInitialState = (claim, documents) => ({
  claim,
  documents,
  verification: null,
  riskAssessment: null,
  errors: [],
  recommendedStatus: null
});

// Node: Document Verification
const documentVerificationNode = async (state) => {
  console.log('🔍 Running Document Verification Agent...');
  
  try {
    const verification = await verifyDocuments(
      state.documents,
      state.claim.type,
      state.claim.policyData
    );
    
    return {
      ...state,
      verification
    };
  } catch (error) {
    console.error('Document verification error:', error);
    return {
      ...state,
      verification: {
        isValid: false,
        error: error.message,
        confidence: 0
      },
      errors: [...state.errors, { agent: 'documentVerifier', error: error.message }]
    };
  }
};

// Node: Risk Assessment
const riskAssessmentNode = async (state) => {
  console.log('⚠️ Running Risk Detection Agent...');
  
  try {
    // Get claim history for the user
    const claims = await readData('claims');
    const userClaimHistory = claims.filter(
      c => c.userId === state.claim.userId && c.id !== state.claim.id
    );
    
    // Get policy data
    const policies = await readData('policies');
    const policy = policies.find(p => p.id === state.claim.policyId);
    
    const riskAssessment = await assessClaimRisk(
      state.claim,
      policy || state.claim.policyData,
      userClaimHistory
    );
    
    return {
      ...state,
      riskAssessment
    };
  } catch (error) {
    console.error('Risk assessment error:', error);
    return {
      ...state,
      riskAssessment: {
        riskScore: 5,
        riskLevel: 'medium',
        recommendation: 'review',
        error: error.message
      },
      errors: [...state.errors, { agent: 'riskDetector', error: error.message }]
    };
  }
};

// Node: Decision Aggregator
const decisionNode = async (state) => {
  console.log('📋 Aggregating agent decisions...');
  
  const { verification, riskAssessment } = state;
  
  // Determine recommended status based on agent outputs
  let recommendedStatus = 'under_review';
  
  if (verification?.isValid === false) {
    // Documents have issues - needs review
    recommendedStatus = 'under_review';
  } else if (riskAssessment?.riskLevel === 'high') {
    // High risk - needs human review
    recommendedStatus = 'under_review';
  } else if (riskAssessment?.riskLevel === 'low' && verification?.isValid === true) {
    // Low risk and valid docs - could auto-approve (but still review for prototype)
    recommendedStatus = 'under_review';
  }
  
  return {
    ...state,
    recommendedStatus
  };
};

// Build the LangGraph workflow
const buildClaimProcessingGraph = () => {
  const workflow = new StateGraph({
    channels: {
      claim: { value: null },
      documents: { value: [] },
      verification: { value: null },
      riskAssessment: { value: null },
      errors: { value: [] },
      recommendedStatus: { value: null }
    }
  });

  // Add nodes
  workflow.addNode('documentVerification', documentVerificationNode);
  workflow.addNode('riskAssessmentNode', riskAssessmentNode);
  workflow.addNode('decision', decisionNode);

  // Define edges - document verification and risk assessment can run in parallel
  workflow.setEntryPoint('documentVerification');
  workflow.addEdge('documentVerification', 'riskAssessmentNode');
  workflow.addEdge('riskAssessmentNode', 'decision');
  workflow.addEdge('decision', END);

  return workflow.compile();
};

// Run the claim processing graph
export const runClaimProcessingGraph = async (claim, documents) => {
  console.log('🚀 Starting Claim Processing Pipeline...');
  console.log(`   Claim ID: ${claim.id}`);
  console.log(`   Type: ${claim.type}`);
  console.log(`   Documents: ${documents.length}`);
  
  const graph = buildClaimProcessingGraph();
  const initialState = createInitialState(claim, documents);
  
  try {
    const result = await graph.invoke(initialState);
    
    console.log('✅ Claim Processing Complete');
    console.log(`   Verification: ${result.verification?.isValid ? 'Valid' : 'Issues Found'}`);
    console.log(`   Risk Level: ${result.riskAssessment?.riskLevel || 'Unknown'}`);
    console.log(`   Recommendation: ${result.recommendedStatus}`);
    
    return {
      verification: result.verification,
      riskAssessment: result.riskAssessment,
      recommendedStatus: result.recommendedStatus,
      errors: result.errors
    };
  } catch (error) {
    console.error('❌ Graph execution error:', error);
    
    // Return safe defaults on error
    return {
      verification: { isValid: false, error: 'Processing failed' },
      riskAssessment: { riskScore: 5, riskLevel: 'medium', recommendation: 'review' },
      recommendedStatus: 'under_review',
      errors: [{ agent: 'graph', error: error.message }]
    };
  }
};

export default { runClaimProcessingGraph };
