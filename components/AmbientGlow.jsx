export default function AmbientGlow() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div
        className="glow-blob"
        style={{ width: 420, height: 420, top: "-10%", left: "-8%", background: "#ff8fa3" }}
      />
      <div
        className="glow-blob"
        style={{ width: 380, height: 380, top: "55%", right: "-10%", background: "#ffb7c5", animationDelay: "3s" }}
      />
      <div
        className="glow-blob"
        style={{ width: 300, height: 300, top: "85%", left: "30%", background: "#ff6f8f", animationDelay: "6s" }}
      />
    </div>
  );
}
