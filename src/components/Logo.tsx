interface LogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ size, className = '', onClick }: LogoProps) {
  const heightClass = size ? '' : 'h-24 sm:h-28 max-w-[38vw]';
  const style = size
    ? { height: `${size}px` }
    : { position: 'fixed' as const, top: 0, left: 0, zIndex: 2147483647 };

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
