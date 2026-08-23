interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ className = '', onClick }: LogoProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="REELY home"
      className={`absolute left-0 top-0 z-0 h-full flex items-center pointer-events-auto ${className}`}
    >
      <img
        src="/reely-logo-watermark.webp"
        alt="REELY"
        className="h-28 sm:h-36 w-auto object-contain opacity-90 select-none"
        draggable={false}
      />
    </button>
  );
}
