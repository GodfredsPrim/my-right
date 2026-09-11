export const supportedLanguages = [
  { code: "en", label: "English", aiName: "English" },
  { code: "tw", label: "Twi", aiName: "Twi (Akan)" },
  { code: "ee", label: "Ewe", aiName: "Ewe" },
  { code: "gaa", label: "Ga", aiName: "Ga" },
  { code: "ha", label: "Hausa", aiName: "Hausa" },
  { code: "yo", label: "Yoruba", aiName: "Yoruba" },
  { code: "ig", label: "Igbo", aiName: "Igbo" },
  { code: "sw", label: "Swahili", aiName: "Swahili" },
  { code: "zu", label: "isiZulu", aiName: "isiZulu" },
  { code: "am", label: "Amharic", aiName: "Amharic" },
  { code: "fr", label: "French", aiName: "French" },
] as const;

export type LanguageCode = (typeof supportedLanguages)[number]["code"];

export function languageName(code: string): string {
  return supportedLanguages.find((language) => language.code === code)?.aiName ?? "English";
}

const copy: Record<LanguageCode, Record<string, string>> = {
  en: {
    language: "Language",
    support: "Get support",
    emergency: "Emergency help",
    privateStart: "A private place to start",
    question: "What would you like help with?",
    noRightWords: "You do not need the right words. Start with a prompt or write in your own way.",
    listen: "Take your time. We're listening.",
    describe: "Describe what is happening...",
    addFile: "Add file",
    record: "Record audio",
    stopRecording: "Stop recording",
    liveVoice: "Live voice",
    endVoice: "End live voice",
    send: "Send message",
    safetyNote: "Your choice matters. AI may help organize information, but it is not a lawyer, doctor, police officer, or emergency service.",
    privateSession: "Private session",
  },
  tw: {
    language: "Kasa",
    support: "Nya mmoa",
    emergency: "Ntɛm mmoa",
    privateStart: "Bea a ɛyɛ kokoam a wobɛfi ase",
    question: "Dɛn na wopɛ mmoa wɔ ho?",
    noRightWords: "Ɛho nhia sɛ wuhu nsɛm a ɛfata. Fi ase wɔ nsɛm a wopɛ anaa kyerɛw w’ankasa kwan so.",
    listen: "Gye wo bere. Yɛretie wo.",
    describe: "Kyerɛkyerɛ nea ɛrekɔ so...",
    addFile: "Fa fael ka ho",
    record: "Kyere nne",
    stopRecording: "Gyae nne a w’akyere",
    liveVoice: "Nneɛma a ɛrekɔ so",
    endVoice: "Gyae nneɛma a ɛrekɔ so",
    send: "Soma nkra",
    safetyNote: "Wo na wusi gyinae. AI betumi aboa ateɛ nsɛm, nanso ɛnyɛ ɔmmaranimfo, oduruyɛfo, polisifo, ɔfotufo, anaa ntɛm adwuma.",
    privateSession: "Kokoam nhyiam",
  },
  ee: { language: "Gbe", support: "Di asi kpekpe", emergency: "Kpekpeɖeŋu le afima", privateStart: "Nɔƒe dzadzɛ a wòate ŋu aɖo ŋgɔ", question: "Nu ka ŋu wòdi kpekpeɖeŋu?", noRightWords: "Mèhiã be nànya nya siwo sɔ. Dze egɔme kple nya si dze ŋuwò, alo ŋlɔ le wò ŋutɔ ƒe mɔ nu.", listen: "Nɔ wò ɣeyiɣi. Míele to kpɔm.", describe: "Ƒo nu tso nu si le dzɔm...", addFile: "Tsɔ fael kpe ɖe ŋu", record: "Ɖe gbe", stopRecording: "Tɔ gbeɖeɖe", liveVoice: "Gbe le afima", endVoice: "Tɔ gbe le afima", send: "Dɔ nyagblɔɖi", safetyNote: "Wòeɖea nu si nàwɔ. AI menye ɖoɖoŋlɔla, dɔyɔla, polisi, afɔɖeɖela, alo kpekpeɖeŋu ƒe dɔwɔla o.", privateSession: "Kokoko nɔƒe" },
  gaa: { language: "Gã", support: "Mi kɛ mɔ", emergency: "He mi kɛ mɔ", privateStart: "Akwɛɛ ni amɛ tsɛɛ miijɔ", question: "Nɔ hewalɛ ni ohiɛ?", noRightWords: "Nɔ hewalɛ ni ohiɛ. Oyi mɔ ni ohiɛ lɛ.", listen: "Kɛ oha ohewalɛ. Miiŋɔɔ o.", describe: "Kɛ nɔ hewalɛ ni ohiɛ...", addFile: "Tsɔ fael", record: "Kɛ gbɛi", stopRecording: "Gyae kɛ gbɛi", liveVoice: "Gbɛi le mli", endVoice: "Gyae gbɛi", send: "Tsɔɔ nɔŋŋ", safetyNote: "Owo oyi mɔ. AI nyɛ mɔɔ, dɔyɔ, polisi, anaa hewalɛ nɔ o.", privateSession: "Akwɛɛ ni amɛ tsɛɛ" },
  ha: { language: "Hausa", support: "Samu taimako", emergency: "Taimakon gaggawa", privateStart: "Wuri mai zaman kansa don farawa", question: "Me kake son taimako a kai?", noRightWords: "Ba sai ka sami kalmomin da suka dace ba. Fara da abin da ya fi sauƙi a gare ka.", listen: "Ka ɗauki lokacinka. Muna sauraronka.", describe: "Bayyana abin da ke faruwa...", addFile: "Ƙara fayil", record: "Yi rikodin sauti", stopRecording: "Dakatar da rikodi", liveVoice: "Muryar kai tsaye", endVoice: "Rufe muryar kai tsaye", send: "Aika saƙo", safetyNote: "Kai ne ke yanke shawara. AI ba lauya ba ne, ba likita ba ne, ba ɗan sanda ba ne, kuma ba sabis na gaggawa ba ne.", privateSession: "Zaman sirri" },
  yo: { language: "Èdè", support: "Gba ìrànlọ́wọ́", emergency: "Ìrànlọ́wọ́ pàjáwìrì", privateStart: "Ibìkan ìkọ̀kọ̀ láti bẹ̀rẹ̀", question: "Kí ni o fẹ́ ìrànlọ́wọ́ pẹ̀lú?", noRightWords: "O kò nílò àwọn ọ̀rọ̀ tó pé. Bẹ̀rẹ̀ pẹ̀lú ohun tó rọrùn fún ọ.", listen: "Má ṣe yára. A ń gbọ́ ọ.", describe: "Ṣàpèjúwe ohun tó ń ṣẹlẹ̀...", addFile: "Fi fáìlì kún un", record: "Gbé ohùn sílẹ̀", stopRecording: "Dá gbigbasilẹ dúró", liveVoice: "Ohùn láàyè", endVoice: "Parí ohùn láàyè", send: "Ránṣẹ́", safetyNote: "Ìwọ ni o ń pinnu. AI kì í ṣe agbẹjọ́rò, dókítà, ọlọ́pàá, tàbí iṣẹ́ pàjáwìrì.", privateSession: "Ìpàdé ìkọ̀kọ̀" },
  ig: { language: "Asụsụ", support: "Nweta enyemaka", emergency: "Enyemaka mberede", privateStart: "Ebe nzuzo ị ga-amalite", question: "Kedu ihe ị chọrọ enyemaka banyere?", noRightWords: "Ị chọghị okwu zuru oke. Malite n’ihe dị mfe ikwu.", listen: "Were oge gị. Anyị na-ege gị ntị.", describe: "Kọwaa ihe na-eme...", addFile: "Tinye faịlụ", record: "Dekọọ olu", stopRecording: "Kwụsị ndekọ", liveVoice: "Olu dị ndụ", endVoice: "Mechie olu dị ndụ", send: "Zipu ozi", safetyNote: "Gị ka ị na-eme mkpebi. AI abụghị ọkàiwu, dọkịta, onye uwe ojii, ma ọ bụ ọrụ mberede.", privateSession: "Nzukọ nzuzo" },
  sw: { language: "Lugha", support: "Pata msaada", emergency: "Msaada wa dharura", privateStart: "Mahali pa faragha pa kuanzia", question: "Ungependa msaada kuhusu nini?", noRightWords: "Huhitaji maneno kamili. Anza kwa njia iliyo rahisi kwako.", listen: "Chukua muda wako. Tunakusikiliza.", describe: "Eleza kinachoendelea...", addFile: "Ongeza faili", record: "Rekodi sauti", stopRecording: "Simamisha kurekodi", liveVoice: "Sauti ya moja kwa moja", endVoice: "Maliza sauti", send: "Tuma ujumbe", safetyNote: "Wewe ndiye unayeamua. AI si wakili, daktari, polisi, wala huduma ya dharura.", privateSession: "Kikao cha faragha" },
  zu: { language: "Ulimi", support: "Thola usizo", emergency: "Usizo oluphuthumayo", privateStart: "Indawo eyimfihlo yokuqala", question: "Ufuna usizo ngani?", noRightWords: "Awudingi amagama aphelele. Qala ngendlela ekhululekile kuwe.", listen: "Thatha isikhathi sakho. Siyakulalela.", describe: "Chaza okwenzekayo...", addFile: "Engeza ifayela", record: "Qopha umsindo", stopRecording: "Misa ukuqopha", liveVoice: "Umsindo obukhoma", endVoice: "Qeda umsindo", send: "Thumela umlayezo", safetyNote: "Nguwe othathayo izinqumo. I-AI ayiyena ummeli, udokotela, iphoyisa, noma usizo oluphuthumayo.", privateSession: "Isikhathi esiyimfihlo" },
  am: { language: "ቋንቋ", support: "ድጋፍ ያግኙ", emergency: "የአደጋ ጊዜ እርዳታ", privateStart: "ለመጀመር የግል ቦታ", question: "በምን ላይ እርዳታ ይፈልጋሉ?", noRightWords: "ፍጹም ቃላት ማግኘት አያስፈልግዎትም። በሚመችዎት መንገድ ይጀምሩ።", listen: "ጊዜዎን ይውሰዱ። እየሰማንዎት ነው።", describe: "የሚከሰተውን ይግለጹ...", addFile: "ፋይል ያክሉ", record: "ድምጽ ይቅረጹ", stopRecording: "ቀረጻውን ያቁሙ", liveVoice: "ቀጥታ ድምጽ", endVoice: "ቀጥታ ድምጽ ይዝጉ", send: "መልዕክት ይላኩ", safetyNote: "ውሳኔው የእርስዎ ነው። AI ጠበቃ፣ ሐኪም፣ ፖሊስ ወይም የአደጋ ጊዜ አገልግሎት አይደለም።", privateSession: "የግል ክፍለ ጊዜ" },
  fr: { language: "Langue", support: "Obtenir de l’aide", emergency: "Aide urgente", privateStart: "Un espace privé pour commencer", question: "Pour quoi avez-vous besoin d’aide ?", noRightWords: "Vous n’avez pas besoin des mots parfaits. Commencez comme vous le pouvez.", listen: "Prenez votre temps. Nous vous écoutons.", describe: "Décrivez ce qui se passe...", addFile: "Ajouter un fichier", record: "Enregistrer l’audio", stopRecording: "Arrêter l’enregistrement", liveVoice: "Voix en direct", endVoice: "Terminer la voix", send: "Envoyer le message", safetyNote: "Vous gardez le contrôle. L’IA n’est ni un avocat, ni un médecin, ni la police, ni un service d’urgence.", privateSession: "Session privée" },
};

export function t(code: LanguageCode, key: string): string {
  return copy[code]?.[key] ?? copy.en[key] ?? key;
}

export function voiceGreeting(code: LanguageCode): string {
  const greetings: Partial<Record<LanguageCode, string>> = {
    en: "This is MY RIGHT. How may I help you today? You can tell me everything in your own words.",
    tw: "Yɛyɛ MY RIGHT. Yɛbɛyɛ dɛn aboa wo nnɛ? Wubetumi aka biribiara wɔ w’ankasa nsɛm mu.",
    ee: "Wɔnye MY RIGHT. Aleke míate ŋu akpe ɖe ŋuwò egbe? Àte ŋu aƒo nu sia nu le wò ŋutɔ ƒe nya me.",
    gaa: "Miiye MY RIGHT. Hɛ miitsɔɔ mɔɔ ohewalɛ? Oyi mɔ ni ohewalɛ nɔ hewalɛ.",
    ha: "Wannan MY RIGHT ne. Ta yaya zan taimaka maka yau? Za ka iya gaya mini komai da kalmominka.",
    yo: "Èyí ni MY RIGHT. Báwo ni mo ṣe lè ràn ọ́ lọ́wọ́ lónìí? O lè sọ ohun gbogbo pẹ̀lú ọ̀rọ̀ tirẹ.",
    ig: "Nke a bụ MY RIGHT. Kedu ka m ga-esi nyere gị aka taa? Ị nwere ike ịgwa m ihe niile n’okwu gị.",
    sw: "Hii ni MY RIGHT. Ninawezaje kukusaidia leo? Unaweza kuniambia kila kitu kwa maneno yako mwenyewe.",
    zu: "Lena yi-MY RIGHT. Ngingakusiza kanjani namuhla? Ungangitshela konke ngamazwi akho.",
    am: "ይህ MY RIGHT ነው። ዛሬ እንዴት ልርዳዎት? ሁሉንም በራስዎ ቃላት መንገር ይችላሉ።",
    fr: "Ici, c’est MY RIGHT. Comment puis-je vous aider aujourd’hui ? Vous pouvez tout me raconter avec vos propres mots.",
  };
  return greetings[code] ?? greetings.en!;
}

export function voiceLocale(code: LanguageCode): string {
  const locales: Partial<Record<LanguageCode, string>> = {
    en: "en-GH", fr: "fr-FR", sw: "sw-KE", am: "am-ET", yo: "yo-NG", ig: "ig-NG", ha: "ha-NG", zu: "zu-ZA",
  };
  return locales[code] ?? "en-GH";
}
