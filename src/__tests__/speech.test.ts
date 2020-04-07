import {voices} from "../speech";

declare var global: any;

it('lists all available voices.', () => {
  const getVoices = jest.fn(() => [
    {
      lang: "en-GB",
      name: "English_(Received_Pronunciation)"
    },
    {
      lang: "en-US",
      name: "English_(America)"
    },
    {
      lang: "sr",
      name: "Serbian"
    }
  ]);

  global.speechSynthesis = {getVoices};

  const vv = voices();
  console.log(vv); // TODO: expect here the result



  //
  // const i18nLanguages: Array<i18n.LanguageID> = [i18n.SERBIAN];
  // const langs = [i18n.SERBIAN, 'en'];
  //
  // const match = matchVoicesAndTranslations(langs.values(), i18nLanguages.values());
  //
  // expect(match).toEqual(['sr']);
});
