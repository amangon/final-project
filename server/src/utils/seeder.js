require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Plan = require('../models/Plan');
const Question = require('../models/Question');
const Achievement = require('../models/Achievement');
const Settings = require('../models/Settings');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Plan.deleteMany({}),
    Question.deleteMany({}), Achievement.deleteMany({}),
    Settings.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // Create Plans
  const plans = await Plan.create([
    {
      name: 'Free', slug: 'free', description: 'Get started with basic features', price: 0,
      duration: 36500, isActive: true, color: '#64748b', sortOrder: 1,
      features: [
        { key: 'basic_interview', name: 'Basic Interview', enabled: true },
        { key: 'basic_report', name: 'Basic Report', enabled: true },
        { key: 'community_support', name: 'Community Support', enabled: true }
      ],
      limits: { dailyInterviews: 5, aiChats: 20, resumeUploads: 1, voiceInterviews: 0, avatarInterviews: 0, certificates: 0 }
    },
    {
      name: 'Pro', slug: 'pro', description: 'Unlock advanced features', price: 499,
      originalPrice: 999, duration: 30, isActive: true, isPopular: true, color: '#6366f1', sortOrder: 2,
      features: [
        { key: 'unlimited_interviews', name: 'Unlimited Interviews', enabled: true, limit: -1 },
        { key: 'resume_analyzer', name: 'Resume Analyzer', enabled: true },
        { key: 'coding_interview', name: 'Coding Interview', enabled: true },
        { key: 'voice_interview', name: 'Voice Interview', enabled: true },
        { key: 'ats_score', name: 'ATS Score', enabled: true },
        { key: 'priority_support', name: 'Priority Support', enabled: true }
      ],
      limits: { dailyInterviews: -1, aiChats: -1, resumeUploads: 5, voiceInterviews: -1, avatarInterviews: 0, certificates: 5 }
    },
    {
      name: 'Pro Max', slug: 'pro-max', description: 'The ultimate interview preparation', price: 999,
      originalPrice: 1999, duration: 30, isActive: true, color: '#8b5cf6', sortOrder: 3,
      features: [
        { key: 'unlimited_everything', name: 'Unlimited Everything', enabled: true, limit: -1 },
        { key: 'ai_mentor', name: 'AI Mentor', enabled: true },
        { key: 'ai_career_coach', name: 'AI Career Coach', enabled: true },
        { key: 'resume_builder', name: 'Resume Builder', enabled: true },
        { key: 'company_specific', name: 'Company Specific Interview', enabled: true },
        { key: 'video_interview', name: 'Video Interview', enabled: true },
        { key: 'ai_avatar', name: 'AI Avatar Interview', enabled: true },
        { key: 'live_lip_sync', name: 'Live Lip Sync', enabled: true },
        { key: 'advanced_analytics', name: 'Advanced Analytics', enabled: true },
        { key: 'certificates', name: 'Certificates', enabled: true },
        { key: 'voice_interview', name: 'Voice Interview', enabled: true }
      ],
      limits: { dailyInterviews: -1, aiChats: -1, resumeUploads: -1, voiceInterviews: -1, avatarInterviews: -1, certificates: -1 }
    }
  ]);
  console.log('Plans created');

  // Create Admin
  await User.create({
    name: process.env.ADMIN_NAME || 'Super Admin',
    email: process.env.ADMIN_EMAIL || 'admin@interviewai.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin', isEmailVerified: true, isActive: true,
    plan: plans[2]._id
  });
  console.log('Admin created');

  // Create Questions
  const questions = [
    { title: 'JavaScript Closures', content: 'Explain closures in JavaScript with a practical example.', type: 'technical', difficulty: 'medium', category: 'JavaScript', tags: ['javascript', 'closures', 'functions'], xpReward: 15 },
    { title: 'React Virtual DOM', content: 'How does the Virtual DOM work in React and why is it important?', type: 'technical', difficulty: 'medium', category: 'React', tags: ['react', 'virtual-dom', 'performance'], xpReward: 15 },
    { title: 'Array Reversal', content: 'Write a function to reverse an array without using the built-in reverse() method.', type: 'coding', difficulty: 'easy', category: 'Arrays', codeTemplate: 'function reverseArray(arr) {\n  // Your solution here\n}', tags: ['arrays', 'algorithms'], xpReward: 10 },
    { title: 'Tell Me About Yourself', content: 'Tell me about yourself and your experience as a developer.', type: 'hr', difficulty: 'easy', category: 'Introduction', tags: ['hr', 'introduction'], xpReward: 5 },
    { title: 'Greatest Challenge', content: 'Describe the most challenging project you have worked on and how you overcame the obstacles.', type: 'behavioral', difficulty: 'medium', category: 'Problem Solving', tags: ['behavioral', 'problem-solving'], xpReward: 10 },
    { title: 'MongoDB Aggregation', content: 'Explain the MongoDB aggregation pipeline and provide an example of when you would use it.', type: 'technical', difficulty: 'hard', category: 'MongoDB', tags: ['mongodb', 'database', 'aggregation'], xpReward: 20 },
    { title: 'Node.js Event Loop', content: 'Explain the Node.js event loop and how it handles asynchronous operations.', type: 'technical', difficulty: 'hard', category: 'Node.js', tags: ['nodejs', 'async', 'event-loop'], xpReward: 20 },
    { title: 'Two Sum Problem', content: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', type: 'coding', difficulty: 'easy', category: 'Hash Map', codeTemplate: 'function twoSum(nums, target) {\n  // Your solution here\n}', tags: ['arrays', 'hash-map', 'leetcode'], xpReward: 15 },
    { title: 'System Design: URL Shortener', content: 'Design a URL shortening service like bit.ly. Discuss the system architecture, database design, and scalability.', type: 'system-design', difficulty: 'hard', category: 'System Design', tags: ['system-design', 'scalability', 'database'], xpReward: 30 },
    { title: 'Salary Expectations', content: 'What are your salary expectations and how did you arrive at that number?', type: 'hr', difficulty: 'medium', category: 'Compensation', tags: ['hr', 'salary', 'negotiation'], xpReward: 10 }
  ];
  await Question.insertMany(questions);
  console.log('Questions created');

  // Create Achievements
  await Achievement.create([
    { name: 'First Interview', description: 'Complete your first interview', icon: '🎯', color: '#6366f1', xpReward: 50, coinsReward: 20, condition: { type: 'interviews', value: 1 }, rarity: 'common' },
    { name: 'Interview Streak 7', description: 'Complete 7 days interview streak', icon: '🔥', color: '#f97316', xpReward: 200, coinsReward: 100, condition: { type: 'streak', value: 7 }, rarity: 'rare' },
    { name: 'Perfect Score', description: 'Score 100% in an interview', icon: '⭐', color: '#eab308', xpReward: 500, coinsReward: 250, condition: { type: 'score', value: 100 }, rarity: 'legendary' },
    { name: 'Century', description: 'Complete 100 interviews', icon: '💯', color: '#8b5cf6', xpReward: 1000, coinsReward: 500, condition: { type: 'interviews', value: 100 }, rarity: 'epic' }
  ]);
  console.log('Achievements created');

  // Create Settings
  await Settings.create([
    { key: 'site_name', value: 'InterviewAI', category: 'general', label: 'Site Name', isPublic: true },
    { key: 'site_tagline', value: 'Practice smarter, get hired faster', category: 'general', label: 'Tagline', isPublic: true },
    { key: 'maintenance_mode', value: false, category: 'general', label: 'Maintenance Mode' },
    { key: 'upi_id', value: 'interviewai@paytm', category: 'payment', label: 'UPI ID' },
    { key: 'merchant_name', value: 'InterviewAI', category: 'payment', label: 'Merchant Name', isPublic: true },
    { key: 'business_name', value: 'InterviewAI Technologies', category: 'payment', label: 'Business Name', isPublic: true },
    { key: 'ai_model', value: 'gpt-3.5-turbo', category: 'ai', label: 'AI Model' },
    { key: 'max_questions_per_interview', value: 10, category: 'general', label: 'Max Questions', isPublic: true }
  ]);
  console.log('Settings created');

  console.log('\n✅ Database seeded successfully!');
  console.log(`Admin: ${process.env.ADMIN_EMAIL || 'admin@interviewai.com'}`);
  console.log(`Password: ${process.env.ADMIN_PASSWORD || 'Admin@123456'}`);
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });