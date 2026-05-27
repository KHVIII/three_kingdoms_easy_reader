import { notFound } from "next/navigation";
import { getChapter, CHAPTER_METADATA } from "@/lib/content";
import ReaderClient from "./reader-client";

export function generateStaticParams() {
  return Array.from({ length: 10 }, (_, i) => ({ chapter: String(i + 1) }));
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const n = parseInt(chapter, 10);
  const data = getChapter(n);
  if (!data) notFound();

  return (
    <ReaderClient
      chapter={data!}
      currentNum={n}
      chapterList={CHAPTER_METADATA}
    />
  );
}
