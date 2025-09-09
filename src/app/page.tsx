import Image from "next/image";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] items-center justify-center w-full">
        <div className="flex flex-col items-center">
          <Image src="/BarHoppr.png" alt="BarHoppr Logo" width={128} height={128} />
          <h1 className="text-4xl font-extrabold">BarHoppr</h1>
        </div>
        <div className="align-center bg-tertiary p-4 rounded-lg font-bold text-4xl">Coming Soon!</div>
      </main>
    </div>
  );
}
