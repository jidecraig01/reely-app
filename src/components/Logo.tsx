interface LogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ size, className = '', onClick }: LogoProps) {
  const heightClass = size ? '' : 'h-32 sm:h-44';
  const style = size ? { height: `${size}px` } : undefined;

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
        style={style}
        className={`${heightClass} w-auto object-contain opacity-90 select-none reely-logo-gloss ${size ? '' : 'fixed left-0 top-0 !z-[2147483647]'}`}
        draggable={false}
      />
    </button>
  );
}
