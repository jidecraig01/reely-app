interface LogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ size, className = '', onClick }: LogoProps) {
  const heightClass = size ? '' : 'h-10 sm:h-12';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="REELY home"
      className={`flex items-start pointer-events-auto ${className}`}
    >
      <img
        src="/reely-logo-watermark.webp"
        alt="REELY"
        className={`${heightClass} w-auto object-contain select-none reely-logo-gloss`}
        draggable={false}
      />
    </button>
  );
}
