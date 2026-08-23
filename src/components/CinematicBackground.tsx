export default function CinematicBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-ink" aria-hidden="true">
      {/* drifting warm spotlight */}
      <div className="absolute -top-1/3 left-1/2 -translate-x-1/2 w-[120vmax] h-[120vmax] reely-sweep" />

      {/* film-strip bands drifting vertically */}
      <div className="absolute inset-0 reely-filmstrips opacity-[0.06]" />

      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#0B0F1A_92%)]" />

      {/* film grain */}
      <div className="absolute inset-0 reely-grain opacity-[0.04] mix-blend-overlay" />
    </div>
  );
}
