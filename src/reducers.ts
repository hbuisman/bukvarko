import {enableMapSet, produce} from "immer";

import {
  ACK_REFOCUS,
  ASK_TO_REFOCUS,
  Action,
  CHANGE_ANSWER,
  GOTO_NEXT_QUESTION,
  GOTO_PREVIOUS_QUESTION,
} from "./actions";
import * as i18n from './i18n';
import * as question from './question';
import * as speech from './speech';
import * as questionBank from "./questionBank";

enableMapSet(); //  See https://immerjs.github.io/immer/docs/installation#pick-your-immer-version

interface StateForTranslation {
  readonly currentQuestion: question.ID;
  readonly answers: Map<question.ID, string>;
}

export interface State {
  readonly translation: i18n.LanguageID | undefined;
  readonly voice: speech.VoiceID | undefined;
  readonly focusPending: boolean;
  readonly forTranslation: Map<i18n.LanguageID, StateForTranslation>
}

function verifyState(state: State) {
  if (speech.get().voicesByTranslation.size === 0) {
    if (state.translation !== undefined) {
      throw Error("There are no voices grouped by translations, but the translation is set.")
    }

    if (state.voice !== undefined) {
      throw Error("There are no voices grouped by translations, but the voice is set.")
    }
  } else {
    if (state.translation === undefined) {
      throw Error("There are voices grouped by translations, but the translation is not set.")
    }

    if (state.voice === undefined) {
      throw Error("There are voices grouped by translations, but the voice is not set.")
    }

    if (!speech.get().voicesByTranslation.get(state.translation)) {
      throw Error(`The translation is not contained in the voices grouped by translations: ${state.translation}`)
    }

    if (speech.get().voicesByTranslation.get(state.translation)!.indexOf(state.voice) === -1) {
      throw Error(`The voice is not contained in the voices by translation ${state.translation}: ${state.voice}`)
    }
  }

  if (state.translation !== undefined) {
    if (!state.forTranslation.has(state.translation)) {
      throw Error(`The state is not available for translation: ${state.translation}`);
    }
  }

  for (const [translation, forTranslation] of state.forTranslation.entries()) {
    const {answers, currentQuestion} = forTranslation;

    if (!questionBank.get().has(currentQuestion)) {
      throw Error(
        `Current question of the translation ${translation} is not in the question bank: ${currentQuestion}`
      );
    }

    for (const id of answers.keys()) {
      if (!questionBank.get().has(id)) {
        throw Error(`Answer of the translation ${translation} is given to a question with an invalid ID: ${id}`);
      }
    }
  }
}

export function initializeState(): State {
  if (questionBank.get().questions.length === 0) {
    throw Error("Unexpected empty list of questions");
  }

  const statesForTranslations = new Map<i18n.LanguageID, StateForTranslation>();
  for (const i18nLang of i18n.get().keys()) {
    statesForTranslations.set(i18nLang, {
      currentQuestion: questionBank.get().questions[0].id,
      answers: new Map<question.ID, string>()
    })
  }

  // Pick the first translation and voice
  let translation: i18n.LanguageID | undefined = undefined;
  let voice: speech.VoiceID | undefined = undefined;
  if (speech.get().voicesByTranslation.size > 0) {
    translation = [...speech.get().voicesByTranslation.keys()].sort()[0];

    const voices = speech.get().voicesByTranslation.get(translation);
    if (!voices || voices.length === 0) {
      throw Error(`Unexpectedly no voices for the translation ${translation} in voices grouped by translations.`);
    }

    voice = voices[0];
  }

  const result: State = {
    translation: translation,
    voice: voice,
    forTranslation: statesForTranslations,
    focusPending: true
  };

  verifyState(result);

  return result;
}

const initialState = initializeState();

export function bukvarkoApp(
  state: State = initialState,
  action: Action
): State {
  const result = produce(state, (draft) => {
    switch (action.type) {
      // TODO: initialize first everything, see that everything fits in the app. Run first app unit test, then in the browser.
      // TODO: change translation, change voice, test that the app works just like that --> run App unit test!

      case CHANGE_ANSWER: {
        if(state.translation === undefined) {
          throw Error(`The translation is undefined hence the action should have never occurred: ${action.type}`)
        }

        const forTranslation = draft.forTranslation.get(state.translation)!;
        forTranslation.answers.set(forTranslation.currentQuestion, action.answer);
        break;
      }

      case GOTO_PREVIOUS_QUESTION: {
        if(state.translation === undefined) {
          throw Error(`The translation is undefined hence the action should have never occurred: ${action.type}`)
        }

        const forTranslation = draft.forTranslation.get(state.translation)!;
        forTranslation.currentQuestion = questionBank.get().previous(forTranslation.currentQuestion);
        break;
      }

      case GOTO_NEXT_QUESTION: {
        if(state.translation === undefined) {
          throw Error(`The translation is undefined hence the action should have never occurred: ${action.type}`)
        }
        const forTranslation = draft.forTranslation.get(state.translation)!;
        forTranslation.currentQuestion = questionBank.get().next(forTranslation.currentQuestion);
        break;
      }

      case ASK_TO_REFOCUS:
        draft.focusPending = true;
        break;

      case ACK_REFOCUS:
        draft.focusPending = false;
    }
  });

  verifyState(result);
  return result;
}
