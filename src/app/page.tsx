import { SearchForm } from "@/components/features/search-form";

export default function Home() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Background with modern gradient mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950" />
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute top-[40%] right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-5xl space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm">
            <span className="text-red-500">Not</span> Google Flights
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Because teleportation is still in beta.
          </p>
        </div>

        <SearchForm />
      </div>
    </main>
  );
}
