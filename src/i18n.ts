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
export type LanguageID = typeof SERBIAN;

function initializeTranslations(): Map<LanguageID, Translation> {
  const result = new Map<LanguageID, Translation>();

  result.set(SERBIAN, serbian);
  return result;
}

export const translations = initializeTranslations();
