import { getChapter } from "@/lib/content";
import RevealClient from "./reveal-client";

export default function RevealPage() {
  return <RevealClient chapter={getChapter(1)!} />;
}
