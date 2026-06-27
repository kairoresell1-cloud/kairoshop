export default function AmbientGlow() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="glow-blob w-48 h-48 md:w-[420px] md:h-[420px]"
        style={{ top: "-10%", left: "-8%", background: "#ff8fa3" }}
      />
      <div
        className="glow-blob w-44 h-44 md:w-[380px] md:h-[380px]"
        style={{ top: "55%", right: "-10%", background: "#ffb7c5", animationDelay: "3s" }}
      />
      <div
        className="glow-blob w-36 h-36 md:w-[300px] md:h-[300px]"
        style={{ top: "85%", left: "30%", background: "#ff6f8f", animationDelay: "6s" }}
      />
    </div>
  );
}
