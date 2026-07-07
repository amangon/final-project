const checkPlanFeature = (featureKey) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (user.role === 'admin') return next();
      
      if (!user.plan) {
        return res.status(403).json({
          error: 'Feature locked',
          code: 'PLAN_REQUIRED',
          feature: featureKey,
          requiredPlan: 'pro'
        });
      }

      const feature = user.plan.features?.find(f => f.key === featureKey);
      
      if (!feature || !feature.enabled) {
        return res.status(403).json({
          error: 'Feature not available in your plan',
          code: 'FEATURE_LOCKED',
          feature: featureKey,
          currentPlan: user.plan.slug
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const checkDailyLimit = async (req, res, next) => {
  try {
    const user = req.user;
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));

    if (!user.dailyInterviewReset || user.dailyInterviewReset < todayStart) {
      user.dailyInterviewCount = 0;
      user.dailyInterviewReset = now;
      await user.save();
    }

    const dailyLimit = user.plan?.limits?.dailyInterviews ?? 5;
    
    if (dailyLimit !== -1 && user.dailyInterviewCount >= dailyLimit) {
      return res.status(429).json({
        error: 'Daily interview limit reached',
        code: 'DAILY_LIMIT_EXCEEDED',
        limit: dailyLimit,
        currentPlan: user.plan?.slug || 'free'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { checkPlanFeature, checkDailyLimit };