import { notFound } from "next/navigation";
import { getChapter, CHAPTER_METADATA } from "@/lib/content";
import ReaderClient from "./reader-client";

export function generateStaticParams() {
  return CHAPTER_METADATA.map((ch) => ({ chapter: String(ch.number) }));
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
