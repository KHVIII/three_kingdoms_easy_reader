export interface Sentence {
  id: string;
  para?: boolean;  // true → first sentence of a new paragraph
  text: string;
  pinyin: (string | null)[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  sentences: Sentence[];
}
