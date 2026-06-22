import { SERVICES } from "@/constants";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <h1 className="font-heading text-4xl font-bold text-primary">{service.title}</h1>
        <p className="mt-4 text-lg text-text/70">{service.description}</p>
        {/* Service detail content */}
      </div>
    </main>
  );
}
