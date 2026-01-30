export default function FeaturesList() {
  const features = [
    {
      emoji: "🪙",
      title: "Edit Currency",
      desc: "Set your wallet and bank balance",
      borderStyle: "border-dotted border-yellow-500",
    },
    {
      emoji: "❤️",
      title: "Health & Stamina",
      desc: "Set your health and stamina values",
      borderStyle: "border-dotted border-red-500",
    },
    {
      emoji: "👤",
      title: "Player & World Names",
      desc: "Change player and world names",
      borderStyle: "border-dotted border-blue-500",
    },
    {
      emoji: "🎮",
      title: "Re-enable Achievements",
      desc: "Remove the creative mode block on Steam achievements",
      borderStyle: "border-dotted border-purple-500",
    },
    {
      emoji: "📦",
      title: "Quick Edit",
      desc: "Fast access to common changes",
      borderStyle: "border-dotted border-green-500",
    },
    {
      emoji: "🔧",
      title: "Advanced Editor",
      desc: "Full JSON editing for power users",
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
