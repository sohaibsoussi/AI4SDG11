import { notFound } from "next/navigation";
import monumentData from "../../../public/data/monuments.json";
import Scene from "../../../components/Scene";
import Link from "next/link";

interface MonumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function MonumentPage({ params }: MonumentPageProps) {
  const { id } = await params;
  const monument = monumentData.find((m) => m.id === id);
  if (!monument) return notFound();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header with monument details */}
      <header className="bg-gray-800 p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold">{monument.name}</h1>
          <p className="mt-4 text-lg">{monument.description}</p>
        </div>
      </header>

      {/* Main content: 3D scene */}
      <main className="flex-1 flex flex-col">
        <div className="container mx-auto flex-1 py-8">
          <div className="w-full h-[70vh] rounded-lg overflow-hidden shadow-lg relative">
            <Scene />
          </div>
        </div>
        {/* Footer with navigation */}
        <footer className="bg-gray-800 py-4">
          <div className="container mx-auto text-center">
            <Link
              href="/"
              className="text-blue-400 hover:text-blue-600 transition-colors text-lg"
            >
              ← Back to Home
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
