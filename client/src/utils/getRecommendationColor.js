const getRecommendationColor = (score) => {
  if (score > 80) return "text-emerald-500";
  if (score > 60) return "text-amber-400/90";
  if (score > 40) return "text-orange-500";
  return "text-rose-500";
};

export default getRecommendationColor;