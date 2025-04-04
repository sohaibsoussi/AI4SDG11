import { notFound } from 'next/navigation';
import monumentData from '../../../public/data/monuments.json';

export default function MonumentPage({ params }: { params: { id: string } }) {
  const monument = monumentData.find((m) => m.id === params.id);
  if (!monument) return notFound();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{monument.name}</h1>
      <p className="mt-2 text-lg">{monument.description}</p>
    </div>
  );
}
