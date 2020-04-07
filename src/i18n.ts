import * as question from './question';

export type ExpectedAnswers = {
  readonly [_ in question.ID]: string
}

interface Translation {
  expectedAnswers: ExpectedAnswers
  hereItSays: string
  nothingIsWrittenHere: string
  questionImageAlt: string
}

const serbian: Translation = {
  expectedAnswers: {
    elephant: "slon",
    tiger: "tigar",
    lion: "lav",
    dog: "pas"
  },
  hereItSays: "Ovde piše",
  nothingIsWrittenHere: "Ovde ništa ne piše.",
  questionImageAlt: "slika-pitanje"
};
export const SERBIAN = "sr";

const croatian: Translation = {
  expectedAnswers: {
    elephant: "slon",
    tiger: "tigar",
    lion: "lav",
    dog: "pas"
  },
  hereItSays: "Ovdje piše",
  nothingIsWrittenHere: "Ovdje ništa ne piše.",
  questionImageAlt: "slika-pitanje"
};
export const CROATIAN = "hr";

const english: Translation = {
  expectedAnswers: {
    elephant: "elephant",
    tiger: "tiger",
    lion: "lion",
    dog: "dog"
  },
  hereItSays: "Here it says",
  nothingIsWrittenHere: "Nothing has been written.",
  questionImageAlt: "question image"
};
export const ENGLISH = "en";

export type LanguageID = typeof SERBIAN | typeof CROATIAN | typeof ENGLISH;

export function initializeTranslations(): Map<LanguageID, Translation> {
  const result = new Map<LanguageID, Translation>();

  result.set(SERBIAN, serbian);
  result.set(CROATIAN, croatian);
  result.set(ENGLISH, english);

  // Post-condition
  if(result.size === 0) {
    throw Error("Expected a non-empty map of translations.")
  }
  return result;
}

const instance = initializeTranslations();
export function get(): typeof instance {
  return instance;
}
