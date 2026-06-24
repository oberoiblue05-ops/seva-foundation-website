import type { Metadata } from "next";
import { BLOG_POSTS } from "../_posts";
import ArticleContent from "./_ArticleContent";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [{ url: `https://picsum.photos/seed/${post.coverSeed}/1200/630`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  return <ArticleContent slug={slug} />;
}
