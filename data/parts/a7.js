window.BQ_BOOKS = {
  intro: "Muslims do not live by the Quran alone. Most of what Islam teaches about prayer, law, Muhammad's life, and the meaning of the Quran comes from other books: hadith (reports of Muhammad's words and deeds), sira (biography), tafsir (commentary) and fiqh (law). Sunni and Shia Muslims accept different hadith collections, and Quranists reject the hadith altogether. Each controversy below links to a full cited card.",
  sections: [
    { id: "hadith", title: "Hadith collections", icon: "📜",
      text: "A hadith has two parts: the isnad (chain of narrators) and the matn (the text). Scholars grade hadith by their chains: Sahih (sound), Hasan (good), Da'if (weak), and Mawdu' (fabricated). Bukhari and Muslim (the 'Two Sahihs') are regarded by Sunnis as the most authentic books after the Quran.",
      items: [
        { name: "Sahih al-Bukhari", by: "Muhammad al-Bukhari (d. 870 AD)", note: "About 7,500 reports with repetitions. Sunni Islam's most trusted collection." },
        { name: "Sahih Muslim", by: "Muslim ibn al-Hajjaj (d. 875 AD)", note: "The second of the 'Two Sahihs.'" },
        { name: "Sunan Abi Dawud", by: "Abu Dawud al-Sijistani (d. 889 AD)", note: "Focus on legal hadith." },
        { name: "Jami' al-Tirmidhi", by: "al-Tirmidhi (d. 892 AD)", note: "Gives grades and the views of the legal schools." },
        { name: "Sunan an-Nasa'i", by: "al-Nasa'i (d. 915 AD)", note: "Known for strict standards." },
        { name: "Sunan Ibn Majah", by: "Ibn Majah (d. 887 AD)", note: "The sixth book; it includes more weak reports." },
        { name: "Muwatta Malik", by: "Malik ibn Anas (d. 795 AD)", note: "The earliest surviving Sunni legal hadith work." },
        { name: "Musnad Ahmad", by: "Ahmad ibn Hanbal (d. 855 AD)", note: "Arranged by narrator; about 27,000 reports." }
      ],
      shia: "Shia Muslims reject many Sunni narrators (the Companions who opposed 'Ali) and use the Four Books: al-Kafi (al-Kulayni), Man La Yahduruhu al-Faqih (Ibn Babawayh), Tahdhib al-Ahkam and al-Istibsar (both by Shaykh al-Tusi). No Shia book is considered entirely sahih.",
      controversies: ["aisha-age", "h-women", "h-apostasy", "h-fight-people", "h-five-prayers", "h-medicine", "stoning-verse", "suckling-verse", "forgotten-surah", "uthman-burning", "ibn-masud", "tahrim", "zaynab", "hira", "s-qurayza", "s-khaybar", "s-kaab"] },
    { id: "sira", title: "Sira (biographies of Muhammad)", icon: "🐪",
      text: "The earliest biographies were written more than a century after Muhammad. Historians rely on them, but hadith scholars often consider their chains weak.",
      items: [
        { name: "Sirat Rasul Allah", by: "Ibn Ishaq (d. c. 767 AD), surviving through Ibn Hisham's edition (d. 833 AD)", note: "The earliest full biography; English translation by A. Guillaume (1955)." },
        { name: "Kitab al-Maghazi", by: "al-Waqidi (d. 823 AD)", note: "Military campaigns; hadith critics considered al-Waqidi weak." },
        { name: "Kitab al-Tabaqat al-Kabir", by: "Ibn Sa'd (d. 845 AD)", note: "Biographies of Muhammad and his Companions." },
        { name: "Tarikh al-Rusul wa al-Muluk (History)", by: "al-Tabari (d. 923 AD)", note: "A universal history, translated into English in 40 volumes (SUNY)." }
      ],
      controversies: ["s-satanic", "s-qurayza", "s-khaybar", "s-kaab", "hira", "hudaybiyyah", "excellent-pattern"] },
    { id: "tafsir", title: "Tafsir (Quran commentary)", icon: "🔎",
      text: "Commentaries explain verses through hadith, the occasions of revelation (asbab al-nuzul), and abrogation (naskh). Classical tafsir usually decides how a disputed verse is applied in law.",
      items: [
        { name: "Jami' al-Bayan (Tafsir al-Tabari)", by: "al-Tabari (d. 923 AD)", note: "The great early commentary built on reports." },
        { name: "Tafsir Ibn Kathir", by: "Ibn Kathir (d. 1373 AD)", note: "The most widely read Sunni commentary in English (abridged)." },
        { name: "Tafsir al-Jalalayn", by: "al-Mahalli and al-Suyuti (15th century)", note: "A short, popular commentary." },
        { name: "Al-Jami' li-Ahkam al-Quran (al-Qurtubi)", by: "al-Qurtubi (d. 1273 AD)", note: "Focus on legal rulings." },
        { name: "Asbab al-Nuzul", by: "al-Wahidi (d. 1075 AD)", note: "The occasions of revelation." }
      ],
      controversies: ["t-654", "t-sword", "wife-discipline", "naskh", "peace-sword", "friendship-unbelievers", "zaynab", "tahrim"] },
    { id: "fiqh", title: "Fiqh (Islamic law)", icon: "⚖️",
      text: "Sunnis follow four schools — Hanafi, Maliki, Shafi'i and Hanbali — and Shia (Twelvers) follow the Ja'fari school. Classical manuals still guide religious rulings today, while modern reformers debate which rulings apply.",
      items: [
        { name: "Umdat al-Salik (Reliance of the Traveller)", by: "Ahmad ibn Naqib al-Misri (d. 1368 AD); English tr. Nuh Ha Mim Keller (1991)", note: "A standard Shafi'i manual." },
        { name: "Al-Hidayah", by: "al-Marghinani (d. 1197 AD)", note: "A standard Hanafi manual." },
        { name: "Ja'fari school", by: "Named for Imam Ja'far al-Sadiq (d. 765 AD)", note: "Twelver Shia law; permits temporary marriage (mut'ah)." }
      ],
      controversies: ["f-apostasy", "f-dhimmi", "f-talaq", "halala", "women-testimony", "polygyny-captives", "warfare-punishment"] }
  ],
  why: [
    { t: "Five daily prayers", d: "The number is not in the Quran; it comes from the hadith of the Night Journey.", id: "h-five-prayers" },
    { t: "Stoning for adultery", d: "Not in the current Quran (24:2 says flogging). 'Umar says a stoning verse was recited and then lost.", id: "stoning-verse" },
    { t: "Aisha's age", d: "Known only from the hadith (Bukhari, Muslim).", id: "aisha-age" },
    { t: "Death for apostasy", d: "From the hadith and fiqh, not from the Quran.", id: "h-apostasy" },
    { t: "Abrogated verses", d: "Which verses cancel which is decided by tafsir and hadith.", id: "naskh" }
  ],
  views: [
    { t: "Sunni", d: "Quran + Sunna (the Six Books) + consensus and analogy; the four schools of law." },
    { t: "Shia", d: "Quran + the Prophet's and Imams' teachings (the Four Books); the Ja'fari school." },
    { t: "Quranist", d: "Quran only; rejects hadith as unreliable. This removes many of the controversies in the hadith but leaves those in the Quran, and makes prayer and law hard to define." }
  ]
};
