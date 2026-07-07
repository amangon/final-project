const logger = require('./logger');
const hasOpenAI = !!process.env.OPENAI_API_KEY;

const analyzeAnswer = async (question, answer) => {
  if (hasOpenAI) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const r = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Expert interviewer. Return JSON: { score:0-100, feedback:string, breakdown:{grammar:0-100,confidence:0-100,relevance:0-100,depth:0-100,keywords:string[]} }' },
          { role: 'user', content: `Question: ${question.content}\nAnswer: ${answer}\nKey points: ${question.keyPoints?.join(', ') || 'N/A'}` }
        ],
        response_format: { type: 'json_object' }
      });
      return JSON.parse(r.choices[0].message.content);
    } catch (e) { logger.warn(`OpenAI failed: ${e.message}`); }
  }
  const wordCount = answer?.split(' ').length || 0;
  const hasKw = question.keyPoints?.some(k => answer?.toLowerCase().includes(k.toLowerCase())) || false;
  const base = Math.min(100, Math.max(20, (wordCount > 50 ? 60 : wordCount > 20 ? 45 : 30) + (hasKw ? 20 : 0) + Math.floor(Math.random() * 15)));
  return {
    score: base,
    feedback: base >= 70 ? `Good answer. Key concepts covered well.` : `Needs more depth. Focus on ${question.keyPoints?.[0] || 'core concepts'} with examples.`,
    breakdown: { grammar: Math.min(100, base + 5), confidence: Math.min(100, base - 5 + Math.floor(Math.random() * 10)), relevance: Math.min(100, base + 3), depth: Math.min(100, base - 8), keywords: question.keyPoints?.slice(0, 3) || [] }
  };
};

const generateFollowUp = async (question, answer) => {
  if (hasOpenAI) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const r = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Expert interviewer. Generate ONE follow-up question to help candidate elaborate. Be professional and guiding.' },
          { role: 'user', content: `Question: ${question.content}\nAnswer: ${answer}` }
        ]
      });
      return r.choices[0].message.content;
    } catch (e) { logger.warn(`OpenAI followup failed: ${e.message}`); }
  }
  const fallbacks = question.followUpQuestions?.length ? question.followUpQuestions : ['Can you elaborate more?', 'Can you give a specific example?', 'How would you handle this in production?', 'What are the trade-offs?'];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

const generateResult = async (interview) => {
  const answers = interview.answers || [];
  const scores = answers.map(a => a.score || 0);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bk = answers.map(a => a.aiAnalysis || {});
  const avgBk = (k) => bk.length ? Math.round(bk.reduce((s, b) => s + (b[k] || 0), 0) / bk.length) : 0;
  const overallScore = avg;
  const grammar = avgBk('grammar'); const confidence = avgBk('confidence');
  const technical = avgBk('relevance'); const communication = avgBk('depth');
  const strengths = [], weaknesses = [];
  if (grammar >= 70) strengths.push('Clear grammatically correct communication'); else weaknesses.push('Work on grammar and sentence structure');
  if (confidence >= 70) strengths.push('Confident assertive delivery'); else weaknesses.push('Build confidence through practice');
  if (technical >= 70) strengths.push('Strong technical knowledge'); else weaknesses.push('Deepen core technical knowledge');
  if (communication >= 70) strengths.push('Structured detailed responses'); else weaknesses.push('Provide more depth and examples');
  const readinessLevel = overallScore >= 85 ? 'expert' : overallScore >= 70 ? 'advanced' : overallScore >= 50 ? 'intermediate' : 'beginner';
  return {
    overallScore,
    scores: { technical, communication, grammar, confidence, problemSolving: avgBk('depth'), behavioural: avgBk('relevance') },
    strengths: strengths.length ? strengths : ['Initiative in attempting the interview'],
    weaknesses: weaknesses.length ? weaknesses : ['Continue practicing to identify areas of improvement'],
    improvementPlan: ['Practice STAR method for behavioral questions', 'Review core technical concepts 30 min daily', 'Record yourself to improve verbal delivery', 'Study company-specific interview patterns', 'Build projects for practical experience'],
    detailedFeedback: `Score: ${overallScore}%. ${readinessLevel === 'expert' ? 'Excellent — interview ready.' : readinessLevel === 'advanced' ? 'Strong performance.' : readinessLevel === 'intermediate' ? 'Good foundation, keep practicing.' : 'Keep going, consistent practice will get you there.'}`,
    questionAnalysis: answers.map((a, i) => ({ question: a.questionText || `Q${i+1}`, answer: a.answer || '', score: a.score || 0, feedback: a.feedback || 'No feedback', suggestions: a.score < 70 ? ['Be specific', 'Add real examples', 'Use technical terms'] : ['Good — maintain this quality'] })),
    timeAnalysis: { totalTime: interview.duration || 0, averageTimePerQuestion: answers.length ? Math.round((interview.duration || 0) / answers.length) : 0, fastestAnswer: answers.length ? Math.min(...answers.map(a => a.duration || 60)) : 0, slowestAnswer: answers.length ? Math.max(...answers.map(a => a.duration || 60)) : 0 },
    recommendation: overallScore >= 70 ? 'Ready to apply. Focus on company-specific prep.' : 'Keep practicing. Focus on fundamentals and projects.',
    readinessLevel
  };
};

const generateAIResponse = async (message, context = []) => {
  if (hasOpenAI) {
    try {
      const OpenAI = require('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const r = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are Alex, expert AI interview coach. Help with interview prep, technical concepts, career advice. Be concise and encouraging.' }, ...context.slice(-6), { role: 'user', content: message }],
        max_tokens: 500
      });
      return r.choices[0].message.content;
    } catch (e) { logger.warn(`OpenAI chat failed: ${e.message}`); }
  }
  const m = message.toLowerCase();
  if (m.includes('react')) return 'React essentials: components, hooks (useState/useEffect/useCallback/useMemo), Virtual DOM, reconciliation, context API. Know when to use each hook.';
  if (m.includes('javascript') || m.includes('js')) return 'JS essentials: closures, hoisting, event loop, promises/async-await, prototype chain, ES6+ features, call/apply/bind.';
  if (m.includes('node')) return 'Node.js: event loop, streams, middleware, REST design, JWT auth, error handling, async patterns.';
  if (m.includes('mongodb')) return 'MongoDB: documents, aggregation pipeline, indexing, schema design, Mongoose ODM. Know when SQL vs NoSQL.';
  if (m.includes('dsa') || m.includes('algorithm')) return 'DSA: arrays, hashmaps, trees, graphs, dynamic programming. Always analyze time/space complexity.';
  if (m.includes('resume')) return 'Resume tips: action verbs + quantified results, match JD keywords for ATS, 1-2 pages, showcase projects with tech + impact.';
  if (m.includes('motivat') || m.includes('nervous')) return 'Nerves are normal. Preparation is your best weapon. Every interview makes you better. You\'ve got this! 💪';
  return 'I am Alex, your AI interview coach! Ask about React, JS, Node, MongoDB, DSA, resume tips, or career advice.';
};

module.exports = { analyzeAnswer, generateFollowUp, generateResult, generateAIResponse };
