export default function FeaturesList() {
  const features = [
    {
      emoji: "🪙",
      title: "Currency",
      desc: "Set your wallet and bank balance",
    },
    {
      emoji: "❤️",
      title: "Health & Stamina",
      desc: "Set your health and stamina values",
    },
    {
      emoji: "👤",
      title: "Player & World Names",
      desc: "Change player and world names",
    },
    {
      emoji: "🎮",
      title: "Steam Achievements",
      desc: "Re-enable achievements blocked by creative mode",
    },
    {
      emoji: "📦",
      title: "Inventory & Containers",
      desc: "Edit player inventory, stashes, and chest contents",
    },
    {
      emoji: "🔧",
      title: "Advanced Editor",
      desc: "Full JSON editing for power users",
    },
  ];

  return (
    <div>
      <h2 class="text-2xl font-bold text-dinkum-tertiary mb-4 font-mclaren">
        What you can edit
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div
            key={feature.title}
            class="rounded-lg p-4 border-2 border-dinkum-primary"
          >
            <h3 class="text-lg font-bold text-dinkum-tertiary font-mclaren mb-1">
              {feature.emoji} {feature.title}
            </h3>
            <p class="text-sm font-mclaren">
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
