export interface Character {
  char: string;
  pinyin: string | null;
}

export interface Sentence {
  id: string;
  characters: Character[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  sentences: Sentence[];
}
