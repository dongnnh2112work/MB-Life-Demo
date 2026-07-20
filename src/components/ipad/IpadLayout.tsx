import Image from "next/image";
import "./ipad-layout.css";

type IpadLayoutProps = {
  children: React.ReactNode;
};

export function IpadLayout({ children }: IpadLayoutProps) {
  return (
    <main className="ipad-screen relative h-dvh w-full overflow-hidden">
      <Image
        src="/ipad/Background.png"
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      <div className="pointer-events-none absolute inset-0 bg-[#050818]/10" />

      <header
        className="absolute z-20"
        style={{
          top: "var(--ipad-logo-top)",
          right: "var(--ipad-logo-right)",
        }}
      >
        <Image
          src="/ipad/Logo.png"
          alt="MB Life — 10 năm"
          width={336}
          height={96}
          className="h-auto w-[var(--ipad-logo-w)]"
          priority
        />
      </header>

      <div className="relative z-10 h-full w-full">{children}</div>
    </main>
  );
}
