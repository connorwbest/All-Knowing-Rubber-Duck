import RubberDuck from "@/app/components/RubberDuck";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-[#030303]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 50%, rgba(160,120,20,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Fog layers */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 120% 60% at 30% 70%, rgba(30,30,30,0.08) 0%, transparent 60%)",
          animation: "fog-drift 20s ease-in-out infinite",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 50% at 70% 60%, rgba(25,25,25,0.06) 0%, transparent 60%)",
          animation: "fog-drift-reverse 25s ease-in-out infinite",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="mb-1 text-center font-mono text-4xl font-bold tracking-tight text-amber-200/60 md:text-5xl">
          The Duck
        </h1>
        <p className="mb-10 text-center font-mono text-sm tracking-widest text-amber-200/20 uppercase">
          Speak your code into the void, he may return your call.
        </p>
        <RubberDuck />
      </div>
    </div>
  );
}
