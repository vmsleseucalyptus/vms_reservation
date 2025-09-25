// app/vehicules/[id]/page.tsx

interface PageProps {
  params: {
    id: string;
  };
}

export default function VehiclePage({ params }: PageProps) {
  const { id } = params;

  return (
    <div>
      <h1>Détails du véhicule</h1>
      <p>ID du véhicule : {id}</p>
    </div>
  );
}
