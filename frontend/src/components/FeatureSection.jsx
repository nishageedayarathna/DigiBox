import React from "react";

const FeatureSection = () => {
  const features = [
    {
      title: "Verified Causes",
      desc: "All causes are validated by local GS/DS officers for authenticity.",
      icon: "✅",
    },
    {
      title: "Micro-Donations",
      desc: "Donate as little as Rs.20 & every bit counts!",
      icon: "💰",
    },
    {
      title: "Transparency",
      desc: "Track donation usage with real-time updates and receipts.",
      icon: "🔍",
    },
    {
      title: "Community Trust",
      desc: "Support local projects and build real human connections.",
      icon: "🤝",
    },
  ];

  return (
    <section className="py-16 bg-[#1F2937]" id="features">
      <h2 className="text-center text-3xl font-bold mb-12 text-primary">
        Why Choose DigiBox?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-[#111827] rounded-2xl p-6 text-center shadow-lg hover:shadow-primary/40 transition"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
