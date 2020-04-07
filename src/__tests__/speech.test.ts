import * as speech from "../speech";
import * as i18n from "../i18n";

it('groups all available voices.', () => {
  const anna = {lang: "en-GB", name: "Anna", default: true};
  const listOfVoices = [
    anna,
    {lang: "en-US", name: "Barbara", default: false},
    {lang: "sr", name: "Lejla", default: false}
  ];

  const voices = new speech.Voices(listOfVoices as SpeechSynthesisVoice[]);

  expect([...voices.ids()].sort(speech.compareByName)).toEqual(
    [
      {lang: 'en-GB', name: "Anna"},
      {lang: 'en-US', name: "Barbara"},
      {lang: 'sr', name: "Lejla"}
    ]);

  // Mind the .toBe -- check for reference, not value!
  expect(voices.get({lang: 'en-GB', name: 'Anna'})).toBe(anna);

  expect(voices.has({lang: 'en-GB', name: 'Anna'})).toBe(true);
  expect(voices.has({lang: 'zh', name: 'Jessica'})).toBe(false);
});

it('filters voices by exact language match.', () => {
  const listOfVoices = [
    {lang: "en-GB", name: "Anna"},
    {lang: "en-US", name: "Barbara"},
    {lang: "sr", name: "Lejla"}
  ];

  const voices = new speech.Voices(listOfVoices as SpeechSynthesisVoice[]);

  expect([...voices.filterByExactLanguage('en-US')].sort()).toEqual(
    [
      {lang: 'en-US', name: "Barbara"}
    ]);
});

it('filters voices by primary language.', () => {
  const listOfVoices = [
    {lang: "en-GB", name: "Anna"},
    {lang: "en-US", name: "Barbara"},
    {lang: "sr", name: "Lejla"}
  ];

  const voices = new speech.Voices(listOfVoices as SpeechSynthesisVoice[]);

  expect([...voices.filterByPrimaryLanguage('en')].sort()).toEqual(
    [
      {lang: "en-GB", name: "Anna"},
      {lang: 'en-US', name: "Barbara"}
    ]);
});

it('filters and groups voices by translations.', () => {
  const listOfVoices = [
    {lang: "en-GB", name: "Anna"},
    {lang: "en-US", name: "Barbara"},
    {lang: "sr", name: "Lejla"}
  ];

  const voices = new speech.Voices(listOfVoices as SpeechSynthesisVoice[]);

  // Fallback for "en", exact match for "sr"
  const i18nLanguages: Array<i18n.LanguageID> = ["en", "sr"];
  const byTranslation = speech.groupVoicesByTranslation(voices, i18nLanguages.values());

  expect(byTranslation).toEqual(
    new Map([
        ["en", [
          {name: "Anna", lang: "en-GB"},
          {name: "Barbara", lang: "en-US"},
        ]],
        ["sr", [
          {name: "Lejla", lang: "sr"}
        ]]
      ]
    ));
});
