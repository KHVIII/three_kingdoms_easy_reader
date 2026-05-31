import { getChapter } from "@/lib/content";
import PopupClient from "./popup-client";

export default function PopupPage() {
  return <PopupClient chapter={getChapter(1)!} />;
}
