import Image from "next/image";

/** The shared BarHoppr mark: a frothy pint inside a location pin. */
export function BrandMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src="/brand/barhoppr-mark.svg"
      width={size}
      height={size}
      className={className}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
