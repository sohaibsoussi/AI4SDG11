import { notFound } from 'next/navigation';
import monumentData from '../../../public/data/monuments.json';

interface MonumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function MonumentPage({ params }: MonumentPageProps) {
  const { id } = await params;
  const monument = monumentData.find((m) => m.id === id);
  if (!monument) return notFound();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{monument.name}</h1>
      <p className="mt-2 text-lg">{monument.description}</p>
    </div>
  );
}
