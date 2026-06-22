interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <article>
          <h1 className="font-heading text-4xl font-bold text-primary">{slug}</h1>
          {/* Article content from Firestore */}
          {/* Comments section */}
        </article>
      </div>
    </main>
  );
}
