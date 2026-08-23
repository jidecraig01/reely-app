export default function CinematicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
      <img
        src="/REELY_BACKGROUND copy.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/45" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,#0B0F1A_95%)]" />
      <div className="absolute inset-0 reely-grain opacity-[0.04] mix-blend-overlay" />
    </div>
  );
}
