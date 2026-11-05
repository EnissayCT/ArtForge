import type { PhoneModel } from "@/lib/phones";
import { cn } from "@/lib/utils";

/** Back view of a printed case, drawn to the phone's real proportions. */
export function PhoneMockup({
  image,
  phone,
  className,
  imageStyle,
  shadow = true,
}: {
  image: string;
  phone: PhoneModel;
  className?: string;
  imageStyle?: React.CSSProperties;
  shadow?: boolean;
}) {
  const pw = (v: number) => `${(v / phone.w) * 100}%`;
  const ph = (v: number) => `${(v / phone.h) * 100}%`;
  const radius = `${pw(phone.radius)} / ${ph(phone.radius)}`;
  const m = phone.module;

  return (
    <div className={cn("relative", className)} style={{ aspectRatio: `${phone.w} / ${phone.h}` }}>
      <div
        className="absolute inset-0 overflow-hidden bg-ink"
        style={{
          borderRadius: radius,
          boxShadow: shadow
            ? "0 1px 1px rgba(0,0,0,.25), 0 18px 30px -12px rgba(0,0,0,.45), 0 40px 60px -30px rgba(0,0,0,.35)"
            : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" style={imageStyle} />
        {/* polycarbonate sheen */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.28)_0%,rgba(255,255,255,0.04)_28%,transparent_46%,transparent_70%,rgba(255,255,255,0.10)_100%)]" />
        {/* case lip */}
        <div className="pointer-events-none absolute inset-0" style={{ borderRadius: radius, boxShadow: "inset 0 0 0 1.5px rgba(10,10,10,.85), inset 0 0 0 3px rgba(255,255,255,.12)" }} />
        {m && (
          <div
            className="absolute bg-[rgba(18,18,18,0.82)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_2px_6px_rgba(0,0,0,0.35)]"
            style={{
              left: pw(m.x),
              top: ph(m.y),
              width: pw(m.w),
              height: ph(m.h),
              borderRadius: `${(m.r / m.w) * 100}% / ${(m.r / m.h) * 100}%`,
            }}
          />
        )}
        {phone.lenses.map((l, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: pw(l.x - l.r),
              top: ph(l.y - l.r),
              width: pw(l.r * 2),
              aspectRatio: "1",
              background:
                "radial-gradient(circle at 38% 34%, rgba(120,140,170,.55) 0 8%, #0b0c10 22%, #050506 58%, #2a2a2c 64%, #0c0c0c 74%, #3b3b3d 100%)",
              boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 1px 3px rgba(0,0,0,.6)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
