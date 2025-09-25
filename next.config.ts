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
      <h1>Details du vehicule</h1>
      <p>ID du vehicule : {id}</p>
    </div>
  );
}
