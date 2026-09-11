import Image from "next/image";

type BrandMarkProps = {
  compact?: boolean;
  animated?: boolean;
};

export function BrandMark({ compact = false, animated = true }: BrandMarkProps) {
  return (
    <span className={`brand-lockup ${animated ? "brand-lockup-animated" : ""}`}>
      <Image
        src="/logo.png"
        alt="MY RIGHT"
        width={compact ? 38 : 46}
        height={compact ? 38 : 46}
        className="brand-logo"
        priority
      />
      {!compact ? <span className="text-sm font-bold tracking-[0.18em]">MY RIGHT</span> : null}
    </span>
  );
}
