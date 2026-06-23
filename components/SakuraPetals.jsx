"use client";

// Petali sakura molto discreti in background — pochi, lenti, opacità bassa.
export default function SakuraPetals() {
  const petals = Array.from({ length: 10 });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {petals.map((_, i) => {
        const left = Math.random() * 100;
        const duration = 14 + Math.random() * 10;
        const delay = Math.random() * 10;
        const size = 8 + Math.random() * 10;

        return (
          <span
            key={i}
            className="petal"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              background:
                "radial-gradient(circle at 30% 30%, #ffd6e0, #ffb7c5)",
              borderRadius: "60% 40% 60% 40%",
            }}
          />
        );
      })}
    </div>
  );
}
