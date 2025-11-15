export default function FeaturesList() {
  const features = [
    {
      emoji: "🪙",
      title: "Infinite Dinks",
      desc: "Edit your wallet and bank account",
      borderStyle: "border-dotted border-yellow-500",
    },
    {
      emoji: "❤️",
      title: "Max Health",
      desc: "Boost health & stamina",
      borderStyle: "border-dotted border-red-500",
    },
    {
      emoji: "👤",
      title: "Rename Stuff",
      desc: "Change player & world names",
      borderStyle: "border-dotted border-blue-500",
    },
    {
      emoji: "🎮",
      title: "Fix Achievements",
      desc: "Undo creative mode flag",
      borderStyle: "border-dotted border-purple-500",
    },
    {
      emoji: "📦",
      title: "Quick Edits",
      desc: "Fast common changes",
      borderStyle: "border-dotted border-green-500",
    },
    {
      emoji: "🔧",
      title: "Power Mode",
      desc: "Full JSON editing",
      borderStyle: "border-dotted border-orange-500",
    },
  ];

  return (
    <div class="bg-dinkum-gray mt-4">
      <h2 class="text-2xl font-bold text-dinkum-tertiary mb-4 font-mclaren text-center">
        ✨ What Can You Do? ✨
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            class={`bg-dinkum-primary/10 rounded-lg p-4 border-2 ${feature.borderStyle} hover:scale-105 transform transition-all hover:shadow-lg`}
          >
            <div class="text-4xl mb-2 text-center">{feature.emoji}</div>
            <h3 class="text-lg font-bold text-dinkum-tertiary font-mclaren text-center mb-1">
              {feature.title}
            </h3>
            <p class="text-sm text-dinkum-accent font-mclaren text-center">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
