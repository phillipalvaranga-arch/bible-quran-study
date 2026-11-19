/* Bible & Quran Study — topic catalog.
   Every Quran and Bible quotation shown in the app is pulled live from the bundled
   public-domain texts (data/quran.json, data/bible.json) using the references below.
   Hadith / classical quotations were copied from the linked pages when this app was built. */
window.BQ_CATS = [
  { id: "dilemma", name: "The Islamic Dilemma", icon: "⚖️", group: "Quran", blurb: "The Quran affirms the Torah and Gospel of its day, yet the Bible contradicts the Quran." },
  { id: "christ", name: "Jesus, the Cross & Salvation", icon: "✝️", group: "Quran", blurb: "Christology, the crucifixion, the Trinity, atonement and assurance." },
  { id: "abrogation", name: "Abrogation & Internal Tensions", icon: "🔀", group: "Quran", blurb: "Naskh (replacing verses) and passages that are hard to reconcile." },
  { id: "manuscript", name: "Preservation & Manuscripts", icon: "📜", group: "Quran", blurb: "How the Quran was collected, standardized, and transmitted." },
  { id: "history", name: "Historical Questions", icon: "🏛️", group: "Quran", blurb: "Anachronisms and parallels with earlier Jewish and Christian legends." },
  { id: "science", name: "Scientific & Cosmological", icon: "🔭", group: "Quran", blurb: "Statements about the sun, stars, embryo and the earth." },
  { id: "social", name: "Controversial Legal & Social", icon: "⚠️", group: "Quran", blurb: "Marriage, women, warfare, punishments and paradise." },
  { id: "sabbath", name: "Sabbath, Covenant & Prophecy", icon: "🕯️", group: "Quran", blurb: "An Adventist and Messianic lens: Sabbath, Israel, the prophet like Moses, the Comforter." },
  { id: "muhammad", name: "Muhammad's Life in Islamic Sources", icon: "🕌", group: "Muhammad", blurb: "What the Quran, Sahih hadith and the early biographies themselves report." },
  { id: "hadith", name: "Controversies in the Hadith", icon: "📚", group: "Other Books", blurb: "Points found inside Bukhari, Muslim, Abu Dawud, Ibn Majah and others." },
  { id: "sira", name: "Controversies in the Sira", icon: "🗺️", group: "Other Books", blurb: "Points found in Ibn Ishaq/Ibn Hisham, al-Tabari and Ibn Sa'd." },
  { id: "tafsir", name: "Controversies in Classical Tafsir", icon: "🖋️", group: "Other Books", blurb: "How the major classical commentaries themselves read hard verses." },
  { id: "fiqh", name: "Controversies in Fiqh & Sharia Manuals", icon: "🏛️", group: "Other Books", blurb: "Classical legal rulings and modern Muslim debate about them." }
];
window.BQ_TOPICS = [];
