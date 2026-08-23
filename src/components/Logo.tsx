interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Logo({ size = 40, className = '', onClick }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`} onClick={onClick}>
      <img
        src="/generated-1787454506378-nodjs.png"
        alt="REELY"
        width={Math.round(size * 1.5)}
        height={size}
        className="hidden"
      />
    </div>
  );
}
