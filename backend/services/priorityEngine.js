/**
 * Priority Calculation & Suggestion Engine
 * Analyzes Category and Description across English, Telugu, and Hindi keywords
 * to recommend High, Moderate, or Low priority.
 */

function calculatePriority(category, description = '') {
  const text = (description || '').toLowerCase();

  // High priority triggers
  const highKeywords = [
    // English
    'danger', 'emergency', 'accident', 'fire', 'electric shock', 'live wire', 'spark', 
    'burst', 'pipe burst', 'contamination', 'hospital', 'school zone', 'collapse', 
    'deep pothole', 'toxic', 'severe', 'flooding', 'urgent', 'hazardous',
    // Telugu
    'ప్రమాదం', 'కరెంట్', 'మంటలు', 'షాక్', 'పడిపోయారు', 'పగిలి', 'అత్యవసరం', 'ఆసుపత్రి', 'తీవ్రమైన', 'వరద',
    // Hindi
    'खतरा', 'आग', 'बिजली', 'करंट', 'दुर्घटना', 'गंभीर', 'अस्पताल', 'फूट', 'आपातकाल', 'बाढ़'
  ];

  // Low priority triggers
  const lowKeywords = [
    // English
    'minor', 'painting', 'faded', 'dustbin color', 'tree branch', 'suggestion', 'routine',
    // Telugu
    'చిన్న', 'రంగు', 'చెట్టు కొమ్మ', 'సలహా',
    // Hindi
    'मामूली', 'रंग', 'पेड़ की शाखा', 'सुझाव'
  ];

  for (const kw of highKeywords) {
    if (text.includes(kw.toLowerCase())) {
      return {
        priority: 'High',
        reason: `High risk detected from description keyword ("${kw}").`
      };
    }
  }

  // Category-based defaults
  if (['Electricity', 'Water', 'Drainage'].includes(category) && text.length > 50) {
    // If lengthy description on critical utilities, lean towards High
    if (text.includes('leak') || text.includes('overflow') || text.includes('off') || text.includes('కారిపోతుంది') || text.includes('बह रहा')) {
      return {
        priority: 'High',
        reason: 'Critical civic utility failure with active leakage or outage.'
      };
    }
  }

  for (const kw of lowKeywords) {
    if (text.includes(kw.toLowerCase())) {
      return {
        priority: 'Low',
        reason: `Non-critical issue identified ("${kw}").`
      };
    }
  }

  return {
    priority: 'Moderate',
    reason: 'Standard municipal response SLA (Default Moderate priority).'
  };
}

module.exports = { calculatePriority };
