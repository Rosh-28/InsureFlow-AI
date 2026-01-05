import { assessRisk } from '../services/geminiService.js';

// Risk factors and their weights
const RISK_FACTORS = {
  claimFrequency: {
    weight: 0.25,
    thresholds: { low: 1, medium: 3, high: 5 } // claims per year
  },
  claimAmount: {
    weight: 0.3,
    thresholds: { low: 0.3, medium: 0.6, high: 0.9 } // percentage of coverage
  },
  timeSinceLastClaim: {
    weight: 0.15,
    thresholds: { low: 180, medium: 90, high: 30 } // days
  },
  policyAge: {
    weight: 0.1,
    thresholds: { low: 365, medium: 180, high: 30 } // days since policy start
  },
  documentQuality: {
    weight: 0.2,
    thresholds: { low: 80, medium: 50, high: 30 } // verification confidence
  }
};

// Assess claim risk using rule-based analysis + Gemini
export const assessClaimRisk = async (claim, policy, claimHistory) => {
  console.log(`  Assessing risk for claim ${claim.id}...`);
  
  // Calculate rule-based risk factors
  const ruleBasedAnalysis = calculateRuleBasedRisk(claim, policy, claimHistory);
  
  // Get AI-powered risk assessment
  let aiAnalysis = null;
  try {
    aiAnalysis = await assessRisk(claim, policy, claimHistory);
  } catch (error) {
    console.log('  AI risk assessment failed, using rule-based only:', error.message);
  }

  // Combine results
  const combinedScore = combineRiskScores(ruleBasedAnalysis, aiAnalysis);
  
  return {
    riskScore: combinedScore.score,
    riskLevel: combinedScore.level,
    factors: ruleBasedAnalysis.factors,
    recommendation: combinedScore.recommendation,
    reasoning: aiAnalysis?.reasoning || ruleBasedAnalysis.reasoning,
    flaggedIssues: [
      ...ruleBasedAnalysis.flaggedIssues,
      ...(aiAnalysis?.flaggedIssues || [])
    ],
    aiAnalysis: aiAnalysis ? {
      score: aiAnalysis.riskScore,
      level: aiAnalysis.riskLevel,
      reasoning: aiAnalysis.reasoning
    } : null
  };
};

// Calculate risk based on rules
const calculateRuleBasedRisk = (claim, policy, claimHistory) => {
  const factors = [];
  const flaggedIssues = [];
  let totalScore = 0;
  let totalWeight = 0;

  // 1. Claim Frequency
  const claimsThisYear = claimHistory.filter(c => {
    const claimDate = new Date(c.createdAt);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return claimDate > oneYearAgo;
  }).length;

  const frequencyRisk = calculateFactorRisk(
    claimsThisYear,
    RISK_FACTORS.claimFrequency.thresholds,
    true
  );
  factors.push({
    factor: 'Claim Frequency',
    value: `${claimsThisYear} claims in past year`,
    impact: frequencyRisk.impact,
    score: frequencyRisk.score
  });
  totalScore += frequencyRisk.score * RISK_FACTORS.claimFrequency.weight;
  totalWeight += RISK_FACTORS.claimFrequency.weight;

  if (claimsThisYear >= RISK_FACTORS.claimFrequency.thresholds.high) {
    flaggedIssues.push('High claim frequency detected');
  }

  // 2. Claim Amount vs Coverage
  if (policy?.coverageAmount && claim.claimAmount) {
    const amountRatio = claim.claimAmount / policy.coverageAmount;
    const amountRisk = calculateFactorRisk(
      amountRatio,
      RISK_FACTORS.claimAmount.thresholds,
      true
    );
    factors.push({
      factor: 'Claim Amount',
      value: `${(amountRatio * 100).toFixed(1)}% of coverage`,
      impact: amountRisk.impact,
      score: amountRisk.score
    });
    totalScore += amountRisk.score * RISK_FACTORS.claimAmount.weight;
    totalWeight += RISK_FACTORS.claimAmount.weight;

    if (claim.claimAmount > policy.coverageAmount) {
      flaggedIssues.push('Claim amount exceeds coverage limit');
    }
  }

  // 3. Time Since Last Claim
  const lastClaim = claimHistory
    .filter(c => c.status !== 'rejected')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

  if (lastClaim) {
    const daysSinceLastClaim = Math.floor(
      (new Date() - new Date(lastClaim.createdAt)) / (1000 * 60 * 60 * 24)
    );
    const timeRisk = calculateFactorRisk(
      daysSinceLastClaim,
      RISK_FACTORS.timeSinceLastClaim.thresholds,
      false // lower is higher risk
    );
    factors.push({
      factor: 'Time Since Last Claim',
      value: `${daysSinceLastClaim} days`,
      impact: timeRisk.impact,
      score: timeRisk.score
    });
    totalScore += timeRisk.score * RISK_FACTORS.timeSinceLastClaim.weight;
    totalWeight += RISK_FACTORS.timeSinceLastClaim.weight;

    if (daysSinceLastClaim < RISK_FACTORS.timeSinceLastClaim.thresholds.high) {
      flaggedIssues.push('Recent claim filed within 30 days');
    }
  } else {
    factors.push({
      factor: 'Time Since Last Claim',
      value: 'First claim',
      impact: 'positive',
      score: 1
    });
    totalScore += 1 * RISK_FACTORS.timeSinceLastClaim.weight;
    totalWeight += RISK_FACTORS.timeSinceLastClaim.weight;
  }

  // 4. Policy Age
  if (policy?.startDate) {
    const policyAgeDays = Math.floor(
      (new Date() - new Date(policy.startDate)) / (1000 * 60 * 60 * 24)
    );
    const ageRisk = calculateFactorRisk(
      policyAgeDays,
      RISK_FACTORS.policyAge.thresholds,
      false // newer policy = higher risk
    );
    factors.push({
      factor: 'Policy Age',
      value: `${policyAgeDays} days`,
      impact: ageRisk.impact,
      score: ageRisk.score
    });
    totalScore += ageRisk.score * RISK_FACTORS.policyAge.weight;
    totalWeight += RISK_FACTORS.policyAge.weight;

    if (policyAgeDays < RISK_FACTORS.policyAge.thresholds.high) {
      flaggedIssues.push('Claim filed on very new policy');
    }
  }

  // Calculate final score (1-10 scale)
  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0.5;
  const finalScore = Math.round(normalizedScore * 9) + 1; // 1-10 scale

  const riskLevel = finalScore <= 3 ? 'low' : finalScore <= 6 ? 'medium' : 'high';
  const recommendation = riskLevel === 'low' ? 'approve' : 
                         riskLevel === 'high' ? 'flag' : 'review';

  return {
    score: finalScore,
    level: riskLevel,
    factors,
    flaggedIssues,
    recommendation,
    reasoning: generateReasoning(factors, flaggedIssues, riskLevel)
  };
};

// Calculate risk for a single factor
const calculateFactorRisk = (value, thresholds, higherIsWorse) => {
  let score, impact;

  if (higherIsWorse) {
    if (value <= thresholds.low) {
      score = 0.2;
      impact = 'positive';
    } else if (value <= thresholds.medium) {
      score = 0.5;
      impact = 'neutral';
    } else {
      score = 0.9;
      impact = 'negative';
    }
  } else {
    if (value >= thresholds.low) {
      score = 0.2;
      impact = 'positive';
    } else if (value >= thresholds.medium) {
      score = 0.5;
      impact = 'neutral';
    } else {
      score = 0.9;
      impact = 'negative';
    }
  }

  return { score, impact };
};

// Combine rule-based and AI risk scores
const combineRiskScores = (ruleBased, ai) => {
  if (!ai || ai.riskScore === undefined) {
    return {
      score: ruleBased.score,
      level: ruleBased.level,
      recommendation: ruleBased.recommendation
    };
  }

  // Weight: 40% rule-based, 60% AI
  const combinedScore = Math.round(ruleBased.score * 0.4 + ai.riskScore * 0.6);
  const level = combinedScore <= 3 ? 'low' : combinedScore <= 6 ? 'medium' : 'high';
  const recommendation = level === 'low' ? 'approve' : 
                         level === 'high' ? 'flag' : 'review';

  return { score: combinedScore, level, recommendation };
};

// Generate human-readable reasoning
const generateReasoning = (factors, flaggedIssues, riskLevel) => {
  const positives = factors.filter(f => f.impact === 'positive');
  const negatives = factors.filter(f => f.impact === 'negative');

  let reasoning = `Risk assessment: ${riskLevel.toUpperCase()}. `;

  if (positives.length > 0) {
    reasoning += `Positive factors: ${positives.map(f => f.factor).join(', ')}. `;
  }

  if (negatives.length > 0) {
    reasoning += `Concerns: ${negatives.map(f => f.factor).join(', ')}. `;
  }

  if (flaggedIssues.length > 0) {
    reasoning += `Flagged issues: ${flaggedIssues.join('; ')}.`;
  }

  return reasoning;
};

export default { assessClaimRisk };
