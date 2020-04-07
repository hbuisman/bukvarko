import * as i18n from './i18n';
import * as bcp47 from './bcp47';

type LanguageBCP47 = string;
type VoiceName = string;

export interface VoiceID {
  lang: LanguageBCP47
  name: VoiceName
}

export class Voices {
  private byBCP47 = new Map<LanguageBCP47, Map<VoiceName, SpeechSynthesisVoice>>();

  constructor(listOfVoices: Array<SpeechSynthesisVoice>) {
    for (const v of listOfVoices) {
      const lang = v.lang;
      let vv: Map<VoiceName, SpeechSynthesisVoice>;
      if (!this.byBCP47.has(lang)) {
        vv = new Map<VoiceName, SpeechSynthesisVoice>();
        this.byBCP47.set(lang, vv);
      } else {
        vv = this.byBCP47.get(lang)!;
      }

      vv.set(v.name, v);
    }

    // Post-conditions
    for (const lang of this.byBCP47.keys()) {
      for (const [name, voice] of this.byBCP47.get(lang)!) {
        if (name !== voice.name) {
          throw Error(`Unexpected voice keyed on ${name} with .name: ${voice.name}`)
        }
      }
    }
  }

  public* ids(): IterableIterator<VoiceID> {
    for (const [lang, byName] of this.byBCP47.entries()) {
      for (const name of byName.keys()) {
        yield {lang: lang, name: name}
      }
    }
  }

  public has(id: VoiceID): boolean {
    const v = this.byBCP47.get(id.lang)?.get(id.name);
    return v !== undefined && v !== null;
  }

  public get(id: VoiceID): SpeechSynthesisVoice {
    const byName = this.byBCP47.get(id.lang);
    if (byName === undefined) {
      throw Error(`The ID is missing in the Voices: ${JSON.stringify(id)}`)
    }

    const voice = byName.get(id.name);
    if (voice === undefined) {
      throw Error(`The ID is missing in the Voices: ${JSON.stringify(id)}`)
    }

    return voice;
  }

  public* filterByExactLanguage(lang: LanguageBCP47): IterableIterator<VoiceID> {
    const byName = this.byBCP47.get(lang);
    if (byName === undefined) {
      return;
    }

    for (const name of byName.keys()) {
      yield {name, lang};
    }
  }

  public* filterByPrimaryLanguage(primaryLanguage: string): IterableIterator<VoiceID> {
    for (const [lang, byName] of this.byBCP47) {
      if (bcp47.primaryLanguage(lang) === primaryLanguage) {
        for (const name of byName.keys()) {
          yield {lang: lang, name: name};
        }
      }
    }
  }
}

export function compareByName(a: VoiceID, b: VoiceID) {
  if (a.name === b.name) {
    if (a.lang === b.lang) {
      return 0;
    } else if (a.lang < b.lang) {
      return -1;
    } else {
      return 1;
    }
  } else if (a.name < b.name) {
    return -1;
  } else {
    return 1;
  }
}

export function groupVoicesByTranslation(
  voices: Voices,
  i18nLangs: IterableIterator<i18n.LanguageID>): Map<i18n.LanguageID, Array<VoiceID>> {
  const r = new Map<i18n.LanguageID, Array<VoiceID>>();

  const upsertAtLanguage = (i18nLang: i18n.LanguageID, id: VoiceID) => {
    let byLang = r.get(i18nLang);
    if (byLang === undefined) {
      byLang = new Array<VoiceID>();
      r.set(i18nLang, byLang);
    }

    byLang.push(id);
  };

  for (const i18nLang of i18nLangs) {
    // If there is the exact match between the language specifications, accept all the voices.
    const exactMatches = voices.filterByExactLanguage(i18nLang);
    let hadExactMatches = false;

    for (const id of exactMatches) {
      hadExactMatches = true;
      upsertAtLanguage(i18nLang, id);
    }

    if (!hadExactMatches) {
      // We need to filter by the primary language and accept those voices as a fallback.
      for (const id of voices.filterByPrimaryLanguage(bcp47.primaryLanguage(i18nLang))) {
        upsertAtLanguage(i18nLang, id);
      }
    }
  }

  const sorted = new Map<i18n.LanguageID, Array<VoiceID>>();
  for (const [i18nLang, langsNames] of r.entries()) {
    sorted.set(i18nLang, langsNames.sort(compareByName));
  }
  return sorted;
}

export function speak(text: string, voice: SpeechSynthesisVoice) {
  const u = new SpeechSynthesisUtterance();
  u.text = text;
  u.voice = voice;
  u.volume = 1; // 0 to 1
  u.rate = 0.7; // 0.1 to 1
  u.pitch = 2; //0 to 2

  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/**
 * Encapsulate the manipulation of the voices in a singleton so that it can be initialized by the proper order.
 */
let instance: Single | undefined = undefined;

class Single {
  public voicesByTranslation: Map<i18n.LanguageID, Array<VoiceID>>;

  constructor(public voices: Voices, i18nLangs: IterableIterator<i18n.LanguageID>) {
    this.voicesByTranslation = groupVoicesByTranslation(voices, i18nLangs);
  }
}

export function initialize(voices: Voices, i18nLangs: IterableIterator<i18n.LanguageID>) {
  instance = new Single(voices, i18nLangs);
}

export function get(): Single {
  if (instance === undefined) {
    throw Error("The speech singleton instance has not been initialized.")
  }
  return instance;
}
