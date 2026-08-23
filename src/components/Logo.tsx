interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ size = 40, showWordmark = true, className = '', onClick }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`} onClick={onClick}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="reely-logo-glow shrink-0"
        aria-label="REELY logo"
      >
        <defs>
          <radialGradient id="reely-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#FF8A3D" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#E8651A" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#E8651A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="reely-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB066" />
            <stop offset="100%" stopColor="#E8651A" />
          </linearGradient>
          <linearGradient id="reely-play" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD08A" />
            <stop offset="100%" stopColor="#FF8A3D" />
          </linearGradient>
        </defs>

        <circle cx="32" cy="32" r="30" fill="url(#reely-glow)" />
        <circle
          cx="32"
          cy="32"
          r="22"
          stroke="url(#reely-ring)"
          strokeWidth="3"
          fill="none"
          opacity="0.9"
        />
        <path
          d="M27 22.5 L44 32 L27 41.5 Z"
          fill="url(#reely-play)"
          stroke="#FFD08A"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>

      {showWordmark && (
        <span className="font-display text-2xl tracking-[0.15em] text-screen">
          REELY
        </span>
      )}
    </div>
  );
}
