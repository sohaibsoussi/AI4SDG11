import { notFound } from 'next/navigation';
import monumentData from '../../../public/data/monuments.json';

interface MonumentPageProps {
  params: { id: string };
}

export default async function MonumentPage({ params }: MonumentPageProps) {
  // Wrap params in a Promise so that it satisfies the expected type.
  const { id } = await Promise.resolve(params);
  
  const monument = monumentData.find((m) => m.id === id);
  if (!monument) return notFound();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{monument.name}</h1>
      <p className="mt-2 text-lg">{monument.description}</p>
    </div>
  );