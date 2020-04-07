type Language = string;
type VoiceName = string;

const LANG_RE = /^[a-z]{2,}$/;

/**
 * @param languages set of acceptable languages
 * @returns map language part of BCP 47 (*e.g.*, "en") -> (voice name -> voice)
 */
export function voices(
  languages: Set<Language> | undefined = undefined): Map<Language, Map<VoiceName, SpeechSynthesisVoice>> {
  // Pre-conditions
  if (languages) {
    for (const lang of languages) {
      if (!lang.match(LANG_RE)) {
        throw Error(`Unexpected acceptable langauge: ${lang}`);
      }
    }
  }

  const result = new Map<Language, Map<VoiceName, SpeechSynthesisVoice>>();

  for (const v of speechSynthesis.getVoices()) {
    const parts = v.lang.split('-');
    if (parts.length > 0) {
      const lang: string = parts[0];

      if (languages !== undefined && !languages.has(lang)) {
        continue;
      }

      let vv: Map<VoiceName, SpeechSynthesisVoice>;
      if (!result.has(lang)) {
        vv = new Map<VoiceName, SpeechSynthesisVoice>();
        result.set(lang, vv);
      } else {
        vv = result.get(lang)!;
      }

      vv.set(v.name, v);
    }
  }

  // Post-conditions
  for (const lang of result.keys()) {
    if (!lang.match(LANG_RE)) {
      throw Error(`Unexpected language not matching ${LANG_RE}: ${lang}`);
    }
  }
  return result;
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
