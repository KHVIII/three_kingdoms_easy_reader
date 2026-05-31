import { getChapter } from "@/lib/content";
import RubyClient from "./ruby-client";

export default function RubyPage() {
  return <RubyClient chapter={getChapter(1)!} />;
}
