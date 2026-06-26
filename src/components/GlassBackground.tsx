export default function GlassBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="gradient-blob blob-a" style={{ width: 600, height: 600, top: -180, left: -180, background: "radial-gradient(circle at 30% 30%, #D97706, transparent 60%)" }} />
      <div className="gradient-blob blob-b" style={{ width: 540, height: 540, top: "30%", right: -200, background: "radial-gradient(circle at 60% 40%, #B8C4A8, transparent 65%)" }} />
      <div className="gradient-blob blob-c" style={{ width: 500, height: 500, bottom: -200, left: "25%", background: "radial-gradient(circle at 50% 50%, #F2C57C, transparent 65%)" }} />
    </div>
  );
}
