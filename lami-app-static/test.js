
function toggleMenu(){
  document.getElementById('sideNav').classList.toggle('open');
  document.getElementById('menuOverlay').classList.toggle('show');
}
function closeMenu(){
  document.getElementById('sideNav').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('show');
}
// ===== DATA =====
const DOCS = [
 {id:1,name:'04 Synth se.pdf',type:'PDF',level:'2ème Année',mod:'Synthèse',date:'2025',size:'260 KB',cat:'synthese',content:'Document PDF — 2ème Année — Synthèse'},
 {id:2,name:'2ème SC 3.docx',type:'DOCX',level:'4ème Année Sciences',mod:'Général',date:'2025',size:'169 KB',cat:'cours',content:'Document DOCX — 4ème Année Sciences — Général'},
 {id:3,name:'2ème Sciences 4.docx',type:'DOCX',level:'4ème Année Sciences',mod:'Général',date:'2025',size:'24 KB',cat:'cours',content:'Document DOCX — 4ème Année Sciences — Général'},
 {id:4,name:'2Lettres 1.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'25 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:5,name:'4ème année Lettres.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Général',date:'2025',size:'40 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Général'},
 {id:6,name:'À la lumière de la raison 2.doc',type:'DOC',level:'3ème Année Lettres',mod:'Raison et Lumières',date:'2025',size:'36 KB',cat:'cours',content:'Document DOC — 3ème Année Lettres — Raison et Lumières'},
 {id:7,name:'A-la-lumière-de-la-raison-Essai-bac-2017-Correction.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Dissertation',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Dissertation'},
 {id:8,name:'bac les tonalités.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Tonalités',date:'2025',size:'40 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Tonalités'},
 {id:9,name:'Bac-blanc_Poesie_proposition-de-correction_dissertation.doc',type:'DOC',level:'3ème Année Lettres',mod:'Poésie',date:'2025',size:'38 KB',cat:'cours',content:'Document DOC — 3ème Année Lettres — Poésie'},
 {id:10,name:'BATRANU_2017_diffusion.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'3401 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Général'},
 {id:11,name:'bibliothèque-de-classe.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Lecture',date:'2025',size:'15 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Lecture'},
 {id:12,name:'Biographie de Simone de Beauvoir.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Général'},
 {id:13,name:'BULTIN DE NOTE.xlsx',type:'XLSX',level:'Non classé',mod:'Général',date:'2025',size:'12 KB',cat:'cours',content:'Document XLSX — Non classé — Général'},
 {id:14,name:'comment argumenter.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'25 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Général'},
 {id:15,name:'Compréhension.docx',type:'DOCX',level:'2ème Année',mod:'Compréhension',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — 2ème Année — Compréhension'},
 {id:16,name:'con_tps_ind_11Concordance.pdf',type:'PDF',level:'2ème Année',mod:'Conjugaison',date:'2025',size:'58 KB',cat:'cours',content:'Document PDF — 2ème Année — Conjugaison'},
 {id:17,name:'concordance des temps.Bac.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Conjugaison',date:'2025',size:'21 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Conjugaison'},
 {id:18,name:'conjugaison.docx',type:'DOCX',level:'2ème Année',mod:'Conjugaison',date:'2025',size:'17 KB',cat:'cours',content:'Document DOCX — 2ème Année — Conjugaison'},
 {id:19,name:'Correction du devoir de synthèse III.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'17 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:20,name:'cours-photoshop.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'302 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:21,name:'DC1-2Sc-3-2017-2018-Je-suis-rentrèe-au-lycée.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'22 KB',cat:'controle',content:'Document DOCX — 2ème Année — Général'},
 {id:22,name:'DC2-la-femme-2-inf-2-B-H-2017-1.doc',type:'DOC',level:'2ème Année',mod:'Femme et Société',date:'2025',size:'40 KB',cat:'controle',content:'Document DOC — 2ème Année — Femme et Société'},
 {id:23,name:'demain-tout-commence-fiche-pedagogique-du-film-fiche-pedagogique-regarder-une-video_98230.doc',type:'DOC',level:'4ème Année Lettres',mod:'Général',date:'2025',size:'1528 KB',cat:'fiche',content:'Document DOC — 4ème Année Lettres — Général'},
 {id:24,name:'dev 1.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'15 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:25,name:'dev 1s11 mod 4.docx',type:'DOCX',level:'1ère Année',mod:'Contrôle',date:'2025',size:'15 KB',cat:'controle',content:'Document DOCX — 1ère Année — Contrôle'},
 {id:26,name:'dev 2ème L mod3.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'16 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:27,name:'dev 2ème mod 5.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'16 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:28,name:'dev 2ème.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'22 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:29,name:'dev 4ème L Mod 1.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Contrôle',date:'2025',size:'18 KB',cat:'controle',content:'Document DOCX — 4ème Année Lettres — Contrôle'},
 {id:30,name:'dev bac.doc',type:'DOC',level:'3ème Année Lettres',mod:'Contrôle',date:'2025',size:'76 KB',cat:'controle',content:'Document DOC — 3ème Année Lettres — Contrôle'},
 {id:31,name:'dev bac.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Contrôle',date:'2025',size:'576 KB',cat:'controle',content:'Document PDF — 3ème Année Lettres — Contrôle'},
 {id:32,name:'dev cont2 2ème L.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'20 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:33,name:'dev controle 1-2ème-lettres.doc',type:'DOC',level:'2ème Année',mod:'Contrôle',date:'2025',size:'66 KB',cat:'controle',content:'Document DOC — 2ème Année — Contrôle'},
 {id:34,name:'dev mod 1 2ème.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'26 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:35,name:'dev mod3.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'13 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:36,name:'dev syn 2ème Lettres.1+2.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'19 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:37,name:'dev syn 2ème Lettres.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'17 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:38,name:'dev syn 3 2ème année.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'21 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:39,name:'dev syn1 2ème sc.docx',type:'DOCX',level:'4ème Année Sciences',mod:'Contrôle',date:'2025',size:'26 KB',cat:'controle',content:'Document DOCX — 4ème Année Sciences — Contrôle'},
 {id:40,name:'dev synt 1 bac lettres 2.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Contrôle',date:'2025',size:'18 KB',cat:'controle',content:'Document DOCX — 3ème Année Lettres — Contrôle'},
 {id:41,name:'Dev-cont1-4è-letttres.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Général',date:'2025',size:'34 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Général'},
 {id:42,name:'dev-Femmes-sté.docx',type:'DOCX',level:'2ème Année',mod:'Femme et Société',date:'2025',size:'43 KB',cat:'cours',content:'Document DOCX — 2ème Année — Femme et Société'},
 {id:43,name:'devoir 1s10 mod4.docx',type:'DOCX',level:'1ère Année',mod:'Contrôle',date:'2025',size:'23 KB',cat:'controle',content:'Document DOCX — 1ère Année — Contrôle'},
 {id:44,name:'devoir 2019.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'18 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:45,name:'devoir 2ème mod 3.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'21 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:46,name:'devoir 2ème mod amour.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'21 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:47,name:'devoir bac lettres mod 3.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Contrôle',date:'2025',size:'26 KB',cat:'controle',content:'Document DOCX — 3ème Année Lettres — Contrôle'},
 {id:48,name:'devoir c 1 2ème sciences 4.docx',type:'DOCX',level:'4ème Année Sciences',mod:'Contrôle',date:'2025',size:'28 KB',cat:'controle',content:'Document DOCX — 4ème Année Sciences — Contrôle'},
 {id:49,name:'devoir contrôle 1 bac L.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Contrôle',date:'2025',size:'20 KB',cat:'controle',content:'Document DOCX — 3ème Année Lettres — Contrôle'},
 {id:50,name:'DEVOIR DE CONTROLE N° 1 francais mr Titty.pdf',type:'PDF',level:'1ère Année',mod:'Contrôle',date:'2025',size:'168 KB',cat:'controle',content:'Document PDF — 1ère Année — Contrôle'},
 {id:51,name:'Devoir de Contrôle N°1 - Français - Bac Economie & Gestion (2016-2017) Mr Megbli-converti.docx',type:'DOCX',level:'Non classé',mod:'Contrôle',date:'2025',size:'59 KB',cat:'controle',content:'Document DOCX — Non classé — Contrôle'},
 {id:52,name:'Devoir de Contrôle N°1 - Français - Bac Technique (2016-2017) Mr Megbli Tarek-converti.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Contrôle',date:'2025',size:'195 KB',cat:'controle',content:'Document DOCX — 3ème Année Lettres — Contrôle'},
 {id:53,name:'Devoir de Contrôle N°2 - Français - 2ème Sciences (2013-2014) Mme SAAD (1).pdf',type:'PDF',level:'4ème Année Sciences',mod:'Contrôle',date:'2025',size:'108 KB',cat:'controle',content:'Document PDF — 4ème Année Sciences — Contrôle'},
 {id:54,name:'devoir de synthèse bac lettres 2.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Contrôle',date:'2025',size:'20 KB',cat:'controle',content:'Document DOCX — 3ème Année Lettres — Contrôle'},
 {id:55,name:'devoir guerre.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'19 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:56,name:'Devoir mod3 2ème.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'26 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:57,name:'devoir modernité.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Modernité',date:'2025',size:'245 KB',cat:'controle',content:'Document PDF — 3ème Année Lettres — Modernité'},
 {id:58,name:'devoir synthèse 1-4ème L2.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Contrôle',date:'2025',size:'19 KB',cat:'controle',content:'Document DOCX — 4ème Année Lettres — Contrôle'},
 {id:59,name:'devoir synthèse 2ème.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'18 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:60,name:'devoir-2eme-travail (1).docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'18 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:61,name:'devoir-4-ème-Souad-Amour.docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'19 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:62,name:'Devoir-de-contrôle-1bac-lettres.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Contrôle',date:'2025',size:'16 KB',cat:'controle',content:'Document DOCX — 3ème Année Lettres — Contrôle'},
 {id:63,name:'Devoir-de-contrôle-3-pour-la-1ère-A-2.docx',type:'DOCX',level:'1ère Année',mod:'Contrôle',date:'2025',size:'18 KB',cat:'controle',content:'Document DOCX — 1ère Année — Contrôle'},
 {id:64,name:'devoir-évasion-rêve-dêtre-sur-scène-1 (1).docx',type:'DOCX',level:'2ème Année',mod:'Contrôle',date:'2025',size:'20 KB',cat:'controle',content:'Document DOCX — 2ème Année — Contrôle'},
 {id:65,name:'Devoir-femme-et-société 1.docx',type:'DOCX',level:'2ème Année',mod:'Femme et Société',date:'2025',size:'27 KB',cat:'controle',content:'Document DOCX — 2ème Année — Femme et Société'},
 {id:66,name:'Devoir-Travail-2ème-Lentraite-1.doc',type:'DOC',level:'2ème Année',mod:'Contrôle',date:'2025',size:'41 KB',cat:'controle',content:'Document DOC — 2ème Année — Contrôle'},
 {id:67,name:'Dev-synt2-bac-blanc-2021 4L.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Synthèse',date:'2025',size:'35 KB',cat:'synthese',content:'Document DOCX — 3ème Année Lettres — Synthèse'},
 {id:68,name:'Dev-synth1-2ème-nadia1 (2).doc',type:'DOC',level:'2ème Année',mod:'Synthèse',date:'2025',size:'48 KB',cat:'synthese',content:'Document DOC — 2ème Année — Synthèse'},
 {id:69,name:'Dev-synth1-2ème-nadia1 (3).doc',type:'DOC',level:'2ème Année',mod:'Synthèse',date:'2025',size:'48 KB',cat:'synthese',content:'Document DOC — 2ème Année — Synthèse'},
 {id:70,name:'Dev-synth1-2ème-nadia1.doc',type:'DOC',level:'2ème Année',mod:'Synthèse',date:'2025',size:'49 KB',cat:'synthese',content:'Document DOC — 2ème Année — Synthèse'},
 {id:71,name:'Dissertation 2L.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Dissertation',date:'2025',size:'15 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Dissertation'},
 {id:72,name:'dissertation poèsie pratique.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Dissertation',date:'2025',size:'24 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Dissertation'},
 {id:73,name:'dissertation sur la poésie 2.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Poésie',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Poésie'},
 {id:74,name:'dissertation sur la poésie 2.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Poésie',date:'2025',size:'40 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Poésie'},
 {id:75,name:'dissertation sur la poésie.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Poésie',date:'2025',size:'22 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Poésie'},
 {id:76,name:'dissertation sur la poésie.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Poésie',date:'2025',size:'187 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Poésie'},
 {id:77,name:'Document.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'17 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:78,name:'elebda3.net-8163 (1).pdf',type:'PDF',level:'Non classé',mod:'Général',date:'2025',size:'869 KB',cat:'cours',content:'Document PDF — Non classé — Général'},
 {id:79,name:'Elle met en parallèle deux réalités pour en faire ressortir des ressemblances ou des différences.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'89 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:80,name:'épreuve bac blanc section lettres.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'17 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Général'},
 {id:81,name:'epreuve finde session.doc',type:'DOC',level:'2ème Année',mod:'Général',date:'2025',size:'70 KB',cat:'cours',content:'Document DOC — 2ème Année — Général'},
 {id:82,name:'Essai-Partage.doc',type:'DOC',level:'3ème Année Lettres',mod:'Dissertation',date:'2025',size:'34 KB',cat:'cours',content:'Document DOC — 3ème Année Lettres — Dissertation'},
 {id:83,name:'Essai-partage.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Dissertation',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Dissertation'},
 {id:84,name:'etude de texte 2ème.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'24 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:85,name:'ETUDE DE TEXTE.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'21 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:86,name:'évaluation 4ème.docx',type:'DOCX',level:'1ère Année',mod:'Général',date:'2025',size:'28 KB',cat:'evaluation',content:'Document DOCX — 1ère Année — Général'},
 {id:87,name:'Evaluation-formative-la-raison.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Raison et Lumières',date:'2025',size:'14 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Raison et Lumières'},
 {id:88,name:'excel shortcuts.pdf',type:'PDF',level:'Non classé',mod:'Général',date:'2025',size:'468 KB',cat:'cours',content:'Document PDF — Non classé — Général'},
 {id:89,name:'EXCERCICE.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'29 KB',cat:'exercice',content:'Document DOCX — 2ème Année — Général'},
 {id:90,name:'Exercice 1.docx',type:'DOCX',level:'2ème Année',mod:'Exercice',date:'2025',size:'14 KB',cat:'exercice',content:'Document DOCX — 2ème Année — Exercice'},
 {id:91,name:'exercice 2ème mod 3.docx',type:'DOCX',level:'2ème Année',mod:'Exercice',date:'2025',size:'22 KB',cat:'exercice',content:'Document DOCX — 2ème Année — Exercice'},
 {id:92,name:'Exercice figure de style. 2ème (Enregistré automatiquement).docx',type:'DOCX',level:'2ème Année',mod:'Figures de Style',date:'2025',size:'14 KB',cat:'exercice',content:'Document DOCX — 2ème Année — Figures de Style'},
 {id:93,name:'Exercice figure de style. 2ème.docx',type:'DOCX',level:'2ème Année',mod:'Figures de Style',date:'2025',size:'14 KB',cat:'exercice',content:'Document DOCX — 2ème Année — Figures de Style'},
 {id:94,name:'Exercice figure de style.docx',type:'DOCX',level:'2ème Année',mod:'Figures de Style',date:'2025',size:'13 KB',cat:'exercice',content:'Document DOCX — 2ème Année — Figures de Style'},
 {id:95,name:'exercices nominalisation bac.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Nominalisation',date:'2025',size:'23 KB',cat:'exercice',content:'Document DOCX — 3ème Année Lettres — Nominalisation'},
 {id:96,name:'exercices-la-nominalisation-def.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Nominalisation',date:'2025',size:'2158 KB',cat:'exercice',content:'Document PDF — 3ème Année Lettres — Nominalisation'},
 {id:97,name:'explication de texte p81.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'13 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:98,name:'explication mod 4 2ème année.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'1 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:99,name:'expression 2ème mod5.docx',type:'DOCX',level:'2ème Année',mod:'Expression',date:'2025',size:'21 KB',cat:'cours',content:'Document DOCX — 2ème Année — Expression'},
 {id:100,name:'expression 4ém mode1 12-2020.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Expression',date:'2025',size:'25 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Expression'},
 {id:101,name:'expression femme et société.doc',type:'DOC',level:'2ème Année',mod:'Femme et Société',date:'2025',size:'34 KB',cat:'cours',content:'Document DOC — 2ème Année — Femme et Société'},
 {id:102,name:'expression librtte.docx',type:'DOCX',level:'2ème Année',mod:'Expression',date:'2025',size:'26 KB',cat:'cours',content:'Document DOCX — 2ème Année — Expression'},
 {id:103,name:'expression mod1 2ème.docx',type:'DOCX',level:'2ème Année',mod:'Expression',date:'2025',size:'28 KB',cat:'cours',content:'Document DOCX — 2ème Année — Expression'},
 {id:104,name:'fiche discours direct.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Discours',date:'2025',size:'26 KB',cat:'fiche',content:'Document DOCX — 4ème Année Lettres — Discours'},
 {id:105,name:'fiche expression 2.docx',type:'DOCX',level:'2ème Année',mod:'Expression',date:'2025',size:'16 KB',cat:'fiche',content:'Document DOCX — 2ème Année — Expression'},
 {id:106,name:'fiche gram mod 4.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Grammaire',date:'2025',size:'15 KB',cat:'fiche',content:'Document DOCX — 4ème Année Lettres — Grammaire'},
 {id:107,name:'fiche la subordination.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Subordination',date:'2025',size:'25 KB',cat:'fiche',content:'Document DOCX — 4ème Année Lettres — Subordination'},
 {id:108,name:'fiche pédagogique mod 4.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Général',date:'2025',size:'16 KB',cat:'fiche',content:'Document DOCX — 4ème Année Lettres — Général'},
 {id:109,name:'Fiche pédagogique.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'18 KB',cat:'fiche',content:'Document DOCX — 2ème Année — Général'},
 {id:110,name:'fiche texte travail et bien être.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'16 KB',cat:'fiche',content:'Document DOCX — 2ème Année — Général'},
 {id:111,name:'Fiche-de-lecture-1.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Lecture',date:'2025',size:'16 KB',cat:'fiche',content:'Document DOCX — 4ème Année Lettres — Lecture'},
 {id:112,name:'FICHE-DE-LECTURE-2.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Lecture',date:'2025',size:'13 KB',cat:'fiche',content:'Document DOCX — 4ème Année Lettres — Lecture'},
 {id:113,name:'francais (1).pdf',type:'PDF',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'1882 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Général'},
 {id:114,name:'francais.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'576 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Général'},
 {id:115,name:'francais_c.doc',type:'DOC',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'676 KB',cat:'cours',content:'Document DOC — 3ème Année Lettres — Général'},
 {id:116,name:'francais_c.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'523 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Général'},
 {id:117,name:'GRAMMAIRE.docx',type:'DOCX',level:'2ème Année',mod:'Grammaire',date:'2025',size:'14 KB',cat:'cours',content:'Document DOCX — 2ème Année — Grammaire'},
 {id:118,name:'Guide_132 a 134.pdf',type:'PDF',level:'Non classé',mod:'Général',date:'2025',size:'590 KB',cat:'cours',content:'Document PDF — Non classé — Général'},
 {id:119,name:'hamdi mned.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'20 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:120,name:'image et filtres.docx',type:'DOCX',level:'2ème Année',mod:'Image et Média',date:'2025',size:'24 KB',cat:'cours',content:'Document DOCX — 2ème Année — Image et Média'},
 {id:121,name:'la cause et la conséquence.docx',type:'DOCX',level:'2ème Année',mod:'Rapports Logiques',date:'2025',size:'25 KB',cat:'cours',content:'Document DOCX — 2ème Année — Rapports Logiques'},
 {id:122,name:'le conditionnel 2ème année.docx',type:'DOCX',level:'2ème Année',mod:'Conditionnel',date:'2025',size:'18 KB',cat:'cours',content:'Document DOCX — 2ème Année — Conditionnel'},
 {id:123,name:'Le conformisme bac L.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Conformisme',date:'2025',size:'15 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Conformisme'},
 {id:124,name:'lecture de limage mod 1.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Lecture',date:'2025',size:'119 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Lecture'},
 {id:125,name:'Les Lumières et la raison.doc',type:'DOC',level:'3ème Année Lettres',mod:'Raison et Lumières',date:'2025',size:'37 KB',cat:'cours',content:'Document DOC — 3ème Année Lettres — Raison et Lumières'},
 {id:126,name:'les rapports logiques.docx',type:'DOCX',level:'2ème Année',mod:'Rapports Logiques',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — 2ème Année — Rapports Logiques'},
 {id:127,name:'Les types et formes de phrases.docx',type:'DOCX',level:'2ème Année',mod:'Types de Phrases',date:'2025',size:'14 KB',cat:'cours',content:'Document DOCX — 2ème Année — Types de Phrases'},
 {id:128,name:'Liste des professeurs présents à la formation du 4 Avril 2018.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'15 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Général'},
 {id:129,name:'Lycée M.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:130,name:'Lycée Secondaire.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'21 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:131,name:'Mémoires de l.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'20 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Général'},
 {id:132,name:'mireille.doc',type:'DOC',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'2149 KB',cat:'cours',content:'Document DOC — 3ème Année Lettres — Général'},
 {id:133,name:'Module 4.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Général',date:'2025',size:'25 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Général'},
 {id:134,name:'Module I. page de garde.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Général',date:'2025',size:'86 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Général'},
 {id:135,name:'module modernité devoir .docx',type:'DOCX',level:'3ème Année Lettres',mod:'Modernité',date:'2025',size:'28 KB',cat:'controle',content:'Document DOCX — 3ème Année Lettres — Modernité'},
 {id:136,name:'Module poésie.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Poésie',date:'2025',size:'26 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Poésie'},
 {id:137,name:'Module.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'15 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:138,name:'Module-dapprentissage-langue-construire-des-explications-la-cause-et-la-conséquence-1.docx',type:'DOCX',level:'2ème Année',mod:'Rapports Logiques',date:'2025',size:'25 KB',cat:'cours',content:'Document DOCX — 2ème Année — Rapports Logiques'},
 {id:139,name:'Niveau.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'26 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:140,name:'Niveau1.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'23 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:141,name:'Niveau111.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'14 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:142,name:'Niveau3.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'26 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:143,name:'Nom.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'18 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:144,name:'Notification daccord Mme Lamia Gnaba (1).pdf',type:'PDF',level:'Non classé',mod:'Général',date:'2025',size:'171 KB',cat:'cours',content:'Document PDF — Non classé — Général'},
 {id:145,name:'nsibti.docx',type:'DOCX',level:'Non classé',mod:'Général',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — Non classé — Général'},
 {id:146,name:'oll-algorithms.pdf',type:'PDF',level:'Non classé',mod:'Général',date:'2025',size:'253 KB',cat:'cours',content:'Document PDF — Non classé — Général'},
 {id:147,name:'Poème Barbara.bac L.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Poésie',date:'2025',size:'15 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Poésie'},
 {id:148,name:'Que les poètes.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'20 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Général'},
 {id:149,name:'repartion 2ème année (Enregistré automatiquement).docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'24 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:150,name:'repartion 2ème année.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'47 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:151,name:'répartition 2ème Mod 3.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'22 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:152,name:'répartition du module.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'16 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:153,name:'révision 2ème.docx',type:'DOCX',level:'2ème Année',mod:'Révision',date:'2025',size:'15 KB',cat:'revision',content:'Document DOCX — 2ème Année — Révision'},
 {id:154,name:'révision bac sc.docx',type:'DOCX',level:'3ème Année Sciences',mod:'Révision',date:'2025',size:'18 KB',cat:'revision',content:'Document DOCX — 3ème Année Sciences — Révision'},
 {id:155,name:'révision compréhension bac sc.docx',type:'DOCX',level:'3ème Année Sciences',mod:'Compréhension',date:'2025',size:'29 KB',cat:'revision',content:'Document DOCX — 3ème Année Sciences — Compréhension'},
 {id:156,name:'Revision du module engagement.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Engagement',date:'2025',size:'19 KB',cat:'revision',content:'Document DOCX — 3ème Année Lettres — Engagement'},
 {id:157,name:'Revision du module Partage (2).docx',type:'DOCX',level:'3ème Année Lettres',mod:'Partage',date:'2025',size:'19 KB',cat:'revision',content:'Document DOCX — 3ème Année Lettres — Partage'},
 {id:158,name:'Revision du module Partage.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Partage',date:'2025',size:'18 KB',cat:'revision',content:'Document DOCX — 3ème Année Lettres — Partage'},
 {id:159,name:'révision finale bas scientifiques.docx',type:'DOCX',level:'3ème Année Sciences',mod:'Révision',date:'2025',size:'18 KB',cat:'revision',content:'Document DOCX — 3ème Année Sciences — Révision'},
 {id:160,name:'Révision module 5.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Révision',date:'2025',size:'22 KB',cat:'revision',content:'Document DOCX — 3ème Année Lettres — Révision'},
 {id:161,name:'subordination 4e L.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Subordination',date:'2025',size:'1998 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Subordination'},
 {id:162,name:'subordination 4e L.pdf',type:'PDF',level:'4ème Année Lettres',mod:'Subordination',date:'2025',size:'527 KB',cat:'cours',content:'Document PDF — 4ème Année Lettres — Subordination'},
 {id:163,name:'Tableau_figures_de_style.docx',type:'DOCX',level:'2ème Année',mod:'Général',date:'2025',size:'17 KB',cat:'cours',content:'Document DOCX — 2ème Année — Général'},
 {id:164,name:'test dia 1ère.docx',type:'DOCX',level:'1ère Année',mod:'Général',date:'2025',size:'28 KB',cat:'evaluation',content:'Document DOCX — 1ère Année — Général'},
 {id:165,name:'test diagnostique 1ère.docx',type:'DOCX',level:'1ère Année',mod:'Général',date:'2025',size:'23 KB',cat:'evaluation',content:'Document DOCX — 1ère Année — Général'},
 {id:166,name:'test diagnostique 3ème.docx',type:'DOCX',level:'1ère Année',mod:'Général',date:'2025',size:'23 KB',cat:'evaluation',content:'Document DOCX — 1ère Année — Général'},
 {id:167,name:'text002.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'2243 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Général'},
 {id:168,name:'text003.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'478 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Général'},
 {id:169,name:'text004.pdf',type:'PDF',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'339 KB',cat:'cours',content:'Document PDF — 3ème Année Lettres — Général'},
 {id:170,name:'texte 1ère année mod 5.docx',type:'DOCX',level:'1ère Année',mod:'Général',date:'2025',size:'14 KB',cat:'cours',content:'Document DOCX — 1ère Année — Général'},
 {id:171,name:'texte bac blanc.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Général',date:'2025',size:'13 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Général'},
 {id:172,name:'texte la pollution.docx',type:'DOCX',level:'2ème Année',mod:'Environnement',date:'2025',size:'13 KB',cat:'cours',content:'Document DOCX — 2ème Année — Environnement'},
 {id:173,name:'texte mod 1.docx',type:'DOCX',level:'4ème Année Lettres',mod:'Général',date:'2025',size:'13 KB',cat:'cours',content:'Document DOCX — 4ème Année Lettres — Général'},
 {id:174,name:'Texte pollution 2.docx',type:'DOCX',level:'2ème Année',mod:'Environnement',date:'2025',size:'17 KB',cat:'cours',content:'Document DOCX — 2ème Année — Environnement'},
 {id:175,name:'Tonalités-ou-registres.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Tonalités',date:'2025',size:'185 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Tonalités'},
 {id:176,name:'Tradition et modernité mod 3.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Modernité',date:'2025',size:'17 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Modernité'},
 {id:177,name:'Versification et formes poétiques.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Poésie',date:'2025',size:'29 KB',cat:'cours',content:'Document DOCX — 3ème Année Lettres — Poésie'},
 {id:178,name:'vocab 2ème mod3.docx',type:'DOCX',level:'2ème Année',mod:'Vocabulaire',date:'2025',size:'22 KB',cat:'vocabulaire',content:'Document DOCX — 2ème Année — Vocabulaire'},
 {id:179,name:'vocab mod 2.docx',type:'DOCX',level:'2ème Année',mod:'Vocabulaire',date:'2025',size:'16 KB',cat:'vocabulaire',content:'Document DOCX — 2ème Année — Vocabulaire'},
 {id:180,name:'vocabulaire-4ème-L.docx',type:'DOCX',level:'3ème Année Lettres',mod:'Vocabulaire',date:'2025',size:'15 KB',cat:'vocabulaire',content:'Document DOCX — 3ème Année Lettres — Vocabulaire'}
];




const AI_KB = {
  bonjour:"Bonjour ! Je suis **LamiAI**, assistant de la Prof. Lamia Gnaba. Comment puis-je vous aider ?",
  aide:"Je peux vous aider avec : 📚 Documents (100 fichiers disponibles) | 📝 Grammaire (subordination, discours, etc.) | 📖 Littérature et poésie | 🎯 Méthodologie Bac | 📋 Exercices pratiques",
  grammaire:"Voici les sujets grammaticaux : ▸ Subordination (4ème Année) ▸ Discours direct/indirect (2ème, 4ème) ▸ Conditionnel (2ème Année) ▸ Rapports logiques ▸ Types de phrases",
  subordination:"La **subordination** (4ème Année) : Complétive (que), Relative (pronom relatif), Circonstancielle (conjonction). Voulez-vous des exercices ?",
  discours:"Le **discours direct/indirect** : Transformez le discours direct (guillemets) en indirect (que + concordance des temps).",
  dissertation:"La **dissertation** : Introduction (amorce, problématique, plan) → Développement (2-3 parties avec arguments + citations) → Conclusion (réponse + ouverture).",
  poesie:"La **poésie** au Bac Lettres : Versification (rimes, rythme), Figures de style (métaphore, comparaison, allitération), Analyse du poème Barbara de Prévert.",
  bac:"Préparation **Bac** : Dissertation (4h), Synthèse (3h), Expression (2h). Modules : Poésie, Modernité, Engagement, Tonalités.",
  documents:"100 documents organisés : Contrôles, Cours, Fiches, Exercices, Synthèses. Par niveau : 1ère, 2ème, 4ème, Bac Lettres, Bac Sciences.",
  merci:"De rien ! Je reste disponible pour vous aider dans votre travail pédagogique.",
};

// ===== PAGES =====
function showPage(id){
  closeMenu();
  document.querySelectorAll('.nav-item').forEach(el=>el.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${id}"]`)?.classList.add('active');
  let html='',title='Accueil',sub='Tableau de bord';

  if(id==='home'){
    title='Accueil'; sub='Tableau de bord';
    html=`
    <div class="grid grid-4" style="margin-bottom:20px">
      <div class="stat"><div style="font-size:28px">📄</div><div style="font-size:26px;font-weight:800;color:var(--p)">180</div><div style="font-size:11px;color:var(--tl)">Documents</div></div>
      <div class="stat"><div style="font-size:28px">📚</div><div style="font-size:26px;font-weight:800;color:var(--s)">7</div><div style="font-size:11px;color:var(--tl)">Niveaux</div></div>
      <div class="stat"><div style="font-size:28px">📋</div><div style="font-size:26px;font-weight:800;color:var(--a)">25+</div><div style="font-size:11px;color:var(--tl)">Modules</div></div>
      <div class="stat"><div style="font-size:28px">🎓</div><div style="font-size:26px;font-weight:800;color:var(--w)">2026</div><div style="font-size:11px;color:var(--tl)">Année</div></div>
    </div>
    <div class="grid grid-2">
      <div class="card" onclick="showPage('ai')" style="cursor:pointer;transition:.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">🤖</span><div><h3>Assistant IA</h3><p style="font-size:12px;color:var(--tl)">Questions et réponses</p></div></div>
      </div>
      <div class="card" onclick="showPage('docs')" style="cursor:pointer;transition:.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">📄</span><div><h3>Documents</h3><p style="font-size:12px;color:var(--tl)">100 fichiers disponibles</p></div></div>
      </div>
      <div class="card" onclick="showPage('ex')" style="cursor:pointer;transition:.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">✏️</span><div><h3>Exercices</h3><p style="font-size:12px;color:var(--tl)">8 exercices interactifs</p></div></div>
      </div>
      <div class="card" onclick="showPage('cal')" style="cursor:pointer;transition:.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex;align-items:center;gap:12px"><span style="font-size:32px">📅</span><div><h3>Emploi du Temps</h3><p style="font-size:12px;color:var(--tl)">Planning cours et examens</p></div></div>
      </div>
    </div>
    <div class="card">
      <h3 style="font-size:14px;font-weight:700;margin-bottom:10px">📄 Documents Récents</h3>
      ${DOCS.slice(0,5).map(d=>`<div style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid var(--b)"><span style="font-size:18px;margin-right:8px">${d.type==='PDF'?'📕':'📘'}</span><div style="flex:1"><div style="font-size:12px;font-weight:600">${d.name}</div><div style="font-size:10px;color:var(--tl)">${d.level} • ${d.mod}</div></div><span class="tag" style="background:${d.type==='PDF'?'#fef2f2':'#eff6ff'};color:${d.type==='PDF'?'#dc2626':'#2563eb'}">${d.type}</span></div>`).join('')}
    </div>
    <div class="card">
      <h3 style="font-size:14px;font-weight:700;margin-bottom:8px">💡 À Propos de LamiAI</h3>
      <p style="font-size:12px;color:var(--tl);line-height:1.6">LamiAI est un assistant pédagogique créé pour aider le Professeur <strong>Lamia Gnaba</strong> dans son travail d'enseignement du français. L'application intègre 100 documents organisés par niveau (1ère, 2ème, 4ème, Bac) et module (Subordination, Poésie, Femme et Société, etc.). Cette PWA fonctionne sur <strong>PC</strong> et <strong>Android</strong> simultanément avec synchronisation automatique.</p>
    </div>`;
  }
  else if(id==='docs'){
    title='Documents'; sub='Explorateur de documents — Prof. Lamia Gnaba';
    html=`
    <div id="docBreadcrumb" style="font-size:12px;color:var(--tl);margin-bottom:12px;display:flex;align-items:center;gap:4px">
      <span style="cursor:pointer;color:var(--p);font-weight:600" onclick="docNav('root')">📁 Tous les niveaux</span>
    </div>
    <div id="docCount" style="font-size:12px;color:var(--tl);margin-bottom:12px"></div>
    <div id="docGrid" class="grid grid-2"></div>
    <div class="card" style="margin-top:16px;background:linear-gradient(135deg,#1e40af,#7c3aed);color:#fff;">
      <h3 style="font-size:14px;font-weight:700;margin-bottom:8px">📤 Générateur de Documents</h3>
      <p style="font-size:11px;opacity:0.85;margin-bottom:10px">Créez des fichiers Word, Excel ou PDF en un clic.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button onclick="generateDoc('word','Devoir de Contrôle - Module Subordination','Contenu pédagogique pour 4ème Année','Lamia Gnaba')" class="btn" style="background:#fff;color:var(--p)">📘 Créer Word</button>
        <button onclick="generateDoc('excel','Notes 2ème Année - Femme et Société','Liste des élèves et notes','Lamia Gnaba')" class="btn" style="background:#fff;color:var(--s)">📊 Créer Excel</button>
        <button onclick="generateDoc('pdf','Fiche Pédagogique - Subordination 4ème Année','Exercices et corrigés - Prof. Gnaba','Lamia Gnaba')" class="btn" style="background:#fff;color:var(--d)">📕 Créer PDF</button>
      </div>
    </div>`;
    setTimeout(()=>docNav('root'), 50);
  }
  else if(id==='ai'){
    title='Assistant IA'; sub='LamiAI - Votre assistant pédagogique';
    html=`
    <div style="display:flex;flex-direction:column;height:calc(100vh - 140px)">
      <div id="chatBox" style="flex:1;overflow:auto;padding-bottom:8px"></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">${['Bonjour','Aide','Grammaire','Subordination','Discours','Dissertation','Poésie','Bac','Figures','Conditionnel','Vocabulaire','Documents','Merci'].map(q=>`<button onclick="quickAI('${q}')" style="padding:5px 10px;border-radius:16px;border:1px solid var(--b);background:#fff;cursor:pointer;font-size:11px;color:var(--p);font-weight:500">${q}</button>`).join('')}</div>
      <div style="display:flex;gap:8px"><input type="text" id="aiInput" placeholder="Tapez votre message..." onkeydown="if(event.key==='Enter') sendAI()" style="flex:1;padding:10px 14px;border-radius:8px;border:1px solid var(--b);font-size:13px"><button onclick="sendAI()" class="btn">📤 Envoyer</button></div>
    </div>`;
    setTimeout(()=>{ document.getElementById('aiInput')?.focus(); renderChat([{text:'Bonjour ! Je suis LamiAI, assistant de la Prof. Lamia Gnaba. Comment puis-je vous aider ?',sender:'ai',t:Date.now()}]); }, 50);
  }
  else if(id==='cal'){
    title='Emploi du Temps'; sub='Emploi du temps — Prof. Lamia Gnaba';
    html=`
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">
      <button onclick="addEmploi()" class="btn">➕ Ajouter un emploi du temps</button>
      <button onclick="deleteEmploi()" class="btn" style="background:var(--d)">🗑️ Supprimer une ligne</button>
      <button onclick="exportEmploi()" class="btn" style="background:var(--s)">📥 Exporter PDF</button>
      <span style="font-size:11px;color:var(--tl);margin-left:auto">Données sauvegardées automatiquement (PC + Android)</span>
    </div>
    <div class="card" style="overflow-x:auto">
      <h3 style="font-size:14px;font-weight:700;margin-bottom:12px">📅 Emploi du Temps Hebdomadaire</h3>
      <table id="emploiTable" style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:10px 8px;border:1px solid var(--b);text-align:left;min-width:80px">Heure</th>
            <th style="padding:10px 8px;border:1px solid var(--b);text-align:center;min-width:120px">Dimanche</th>
            <th style="padding:10px 8px;border:1px solid var(--b);text-align:center;min-width:120px">Lundi</th>
            <th style="padding:10px 8px;border:1px solid var(--b);text-align:center;min-width:120px">Mardi</th>
            <th style="padding:10px 8px;border:1px solid var(--b);text-align:center;min-width:120px">Mercredi</th>
            <th style="padding:10px 8px;border:1px solid var(--b);text-align:center;min-width:120px">Jeudi</th>
            <th style="padding:10px 8px;border:1px solid var(--b);text-align:center;min-width:120px">Vendredi</th>
          </tr>
        </thead>
        <tbody id="emploiBody"></tbody>
      </table>
    </div>
    <div class="card" style="margin-top:12px">
      <h3 style="font-size:13px;font-weight:700;margin-bottom:8px">📊 Statistiques semaine</h3>
      <div id="emploiStats" style="display:flex;gap:16px;flex-wrap:wrap"></div>
    </div>`;
    setTimeout(loadEmploi, 50);
  }
  else if(id==='cours'){
    title='Mes Cours'; sub='Cours organisés par niveau';
    html=`
    <div class="grid grid-2">
      <div class="card" onclick="alert('Module 1 - Subordination')" style="cursor:pointer"><h3 style="font-size:16px;font-weight:700">4ème Année - Module 1</h3><p style="font-size:12px;color:var(--tl);margin:4px 0">Subordination, Discours direct, Page de garde</p><span class="tag" style="background:#eff6ff;color:#2563eb">3 documents</span></div>
      <div class="card" onclick="alert('Module Femme et Société')" style="cursor:pointer"><h3 style="font-size:16px;font-weight:700">2ème Année - Femme et Société</h3><p style="font-size:12px;color:var(--tl);margin:4px 0">Condition féminine, Vocabulaire, Devoirs</p><span class="tag" style="background:#f0fdf4;color:#16a34a">5 documents</span></div>
      <div class="card" onclick="alert('Module Poésie - Bac Lettres')" style="cursor:pointer"><h3 style="font-size:16px;font-weight:700">Bac Lettres - Poésie</h3><p style="font-size:12px;color:var(--tl);margin:4px 0">Barbara, Versification, Module Poésie</p><span class="tag" style="background:#fef2f2;color:#dc2626">4 documents</span></div>
      <div class="card" onclick="alert('Grammaire 2ème Année')" style="cursor:pointer"><h3 style="font-size:16px;font-weight:700">2ème Année - Grammaire</h3><p style="font-size:12px;color:var(--tl);margin:4px 0">Conditionnel, Rapports logiques, Phrases</p><span class="tag" style="background:#eff6ff;color:#2563eb">4 documents</span></div>
    </div>`;
  }
  else if(id==='niv'){
    title='Niveaux'; sub='Niveaux d\'enseignement';
    const n = [
      {name:'1ère Année',col:'#3b82f6',ic:'📖'},
      {name:'2ème Année',col:'#059669',ic:'📚'},
      {name:'2ème Sciences',col:'#8b5cf6',ic:'🔬'},
      {name:'2ème Lettres',col:'#ec4899',ic:'📝'},
      {name:'4ème Année',col:'#f59e0b',ic:'🎓'},
      {name:'Bac Lettres',col:'#dc2626',ic:'🏆'},
      {name:'Bac Sciences',col:'#0891b2',ic:'🧬'},
    ];
    html=`<div class="grid grid-4">${n.map(x=>`<div class="card" style="border-top:3px solid ${x.col}"><div style="font-size:28px">${x.ic}</div><h3 style="font-size:15px;font-weight:700;margin:8px 0">${x.name}</h3></div>`).join('')}</div>`;
  }
  else if(id==='ex'){
    title='Exercices'; sub='8 exercices interactifs';
    html=`
    <div class="grid grid-2">
      ${[
        {t:'Exercice Subordination',l:'4ème Année',m:'Module 1'},
        {t:'Exercice Discours Direct',l:'4ème Année',m:'Module 1'},
        {t:'Exercice Vocabulaire Femme',l:'2ème Année',m:'Femme et Société'},
        {t:'Exercice Figures de Style',l:'2ème Année',m:'Figures'},
        {t:'Conditionnel',l:'2ème Année',m:'Grammaire'},
        {t:'Rapports Logiques',l:'2ème Année',m:'Grammaire'},
        {t:'Nominalisation Bac',l:'Bac Lettres',m:'Grammaire'},
        {t:'Dissertation',l:'Bac Lettres',m:'Méthodologie'},
      ].map(e=>`<div class="card" onclick="alert('Exercice : ${e.t}')" style="cursor:pointer"><h3 style="font-size:14px;font-weight:700">✏️ ${e.t}</h3><p style="font-size:11px;color:var(--tl)">${e.l} • ${e.m}</p></div>`).join('')}
    </div>`;
  }
  else if(id==='set'){
    title='Paramètres'; sub='Configuration';
    html=`
    <div class="card"><h3>👩‍🏫 Profil</h3><div class="grid grid-4"><div><label style="font-size:11px;font-weight:600;color:var(--tl)">Nom</label><input value="Lamia Gnaba" readonly></div><div><label style="font-size:11px;font-weight:600;color:var(--tl)">Matière</label><input value="Français" readonly></div><div><label style="font-size:11px;font-weight:600;color:var(--tl)">Établissement</label><input value="Lycée" readonly></div><div><label style="font-size:11px;font-weight:600;color:var(--tl)">Année</label><input value="2025-2026" readonly></div></div></div>
    <div class="card"><h3>🎯 Niveaux Enseignés</h3><div style="display:flex;gap:6px;flex-wrap:wrap">${[{n:'1ère Année',c:'#3b82f6'},{n:'2ème Année',c:'#059669'},{n:'4ème Année',c:'#f59e0b'},{n:'Bac Lettres',c:'#dc2626'},{n:'Bac Sciences',c:'#0891b2'}].map(x=>`<span class="tag" style="background:${x.c}20;color:${x.c};padding:6px 10px">${x.n}</span>`).join('')}</div></div>
    <div class="card"><h3>📊 Statistiques</h3><div class="grid grid-4"><div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--p)">100</div><div style="font-size:10px;color:var(--tl)">Documents</div></div><div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--s)">7</div><div style="font-size:10px;color:var(--tl)">Niveaux</div></div><div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--w)">25+</div><div style="font-size:10px;color:var(--tl)">Modules</div></div><div style="text-align:center;padding:12px;background:#f8fafc;border-radius:8px"><div style="font-size:20px;font-weight:800;color:var(--a)">8</div><div style="font-size:10px;color:var(--tl)">Exercices</div></div></div></div>`;
  }

  document.getElementById('pageTitle').textContent=title;
  document.getElementById('pageSub').textContent=sub;
  document.getElementById('content').innerHTML=html;
  window.scrollTo({top:0,behavior:'smooth'})
}

let docPath = [];

function docNav(target) {
  if (target === 'root') { docPath = []; }
  else if (target === 'back') { docPath.pop(); }
  else { docPath.push(target); }
  renderDocExplorer();
}

function renderDocExplorer() {
  const grid = document.getElementById('docGrid');
  const breadcrumb = document.getElementById('docBreadcrumb');
  const count = document.getElementById('docCount');
  if (!grid) return;

  let bc = '<span style="cursor:pointer;color:var(--p);font-weight:600" onclick="docNav(\'root\')">📁 Tous les niveaux</span>';
  docPath.forEach((p, i) => {
    bc += ' <span style="color:var(--tl)">›</span> ';
    if (i === docPath.length - 1) {
      bc += '<span style="font-weight:600">' + p + '</span>';
    } else {
      bc += '<span style="cursor:pointer;color:var(--p)" onclick="docPath.splice(' + (i + 1) + ');renderDocExplorer()">' + p + '</span>';
    }
  });
  breadcrumb.innerHTML = bc;

  if (docPath.length === 0) {
    const levels = {};
    DOCS.forEach(d => { levels[d.level] = (levels[d.level] || 0) + 1; });
    const icons = {'1ère Année':'📗','2ème Année':'📘','3ème Année Lettres':'📕','3ème Année Sciences':'🔬','4ème Année Lettres':'📗','4ème Année Sciences':'🔬','Non classé':'❓'};
    const colors = {'1ère Année':'#059669','2ème Année':'#2563eb','3ème Année Lettres':'#dc2626','3ème Année Sciences':'#8b5cf6','4ème Année Lettres':'#f59e0b','4ème Année Sciences':'#0891b2','Non classé':'#6b7280'};
    count.textContent = Object.keys(levels).length + ' niveaux — ' + DOCS.length + ' documents';
    grid.className = 'grid grid-2';
    grid.innerHTML = Object.entries(levels).sort().map(([l, n]) =>
      `<div class="card" onclick="docNav('${l}')" style="cursor:pointer;border-left:4px solid ${colors[l]||'#6b7280'};transition:.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:36px">${icons[l]||'📄'}</span>
          <div><div style="font-size:16px;font-weight:700">${l}</div><div style="font-size:12px;color:var(--tl)">${n} document${n>1?'s':''}</div></div>
        </div>
      </div>`
    ).join('');
    return;
  }

  if (docPath.length === 1) {
    const level = docPath[0];
    const cats = {};
    DOCS.filter(d => d.level === level).forEach(d => { cats[d.cat] = (cats[d.cat] || 0) + 1; });
    const catIcons = {controle:'📋',cours:'📚',exercice:'✏️',fiche:'📄',synthese:'📝',vocabulaire:'🔤',revision:'🔄',evaluation:'📊',general:'📁'};
    const catNames = {controle:'Contrôles',cours:'Cours',exercice:'Exercices',fiche:'Fiches',synthese:'Synthèses',vocabulaire:'Vocabulaire',revision:'Révisions',evaluation:'Évaluations',general:'Général'};
    const docsInLevel = DOCS.filter(d => d.level === level).length;
    count.textContent = level + ' — ' + docsInLevel + ' documents, ' + Object.keys(cats).length + ' catégories';
    grid.className = 'grid grid-2';
    grid.innerHTML = Object.entries(cats).sort().map(([c, n]) =>
      `<div class="card" onclick="docNav('${c}')" style="cursor:pointer;border-left:4px solid var(--p);transition:.2s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex;align-items:center;gap:12px">
          <span style="font-size:32px">${catIcons[c]||'📁'}</span>
          <div><div style="font-size:15px;font-weight:700">${catNames[c]||c}</div><div style="font-size:12px;color:var(--tl)">${n} document${n>1?'s':''}</div></div>
        </div>
      </div>`
    ).join('');
    return;
  }

  if (docPath.length === 2) {
    const level = docPath[0];
    const cat = docPath[1];
    const docs = DOCS.filter(d => d.level === level && d.cat === cat);
    count.textContent = docs.length + ' document(s)';
    grid.className = 'grid grid-1';
    grid.innerHTML = docs.map(d => {
      const saved = localStorage.getItem('lami-doc-' + d.id);
      return `<div class="card" onclick="openDoc(${d.id})" style="display:flex;gap:12px;align-items:flex-start;cursor:pointer;transition:.2s;border-left:3px solid ${d.type==='PDF'?'#dc2626':'#2563eb'}" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
        <span style="font-size:28px">${d.type==='PDF'?'📕':'📘'}</span>
        <div style="flex:1"><div style="font-size:13px;font-weight:700">${d.name}</div>
        <div style="font-size:11px;color:var(--tl);margin-top:2px">${d.mod} • ${d.size}</div>
        <div style="display:flex;gap:6px;margin-top:6px;align-items:center"><span class="tag" style="background:#fef2f2;color:#dc2626">${d.type}</span>${saved?'<span class="tag" style="background:#fef3c7;color:#d97706">✏️ Modifié</span>':''}</div></div>
        <span style="font-size:16px;color:var(--tl)">→</span></div>`;
    }).join('');
    return;
  }
}

let currentDocId=null;

function openDoc(id){
  const doc=DOCS.find(d=>d.id===id);
  if(!doc)return;
  currentDocId=id;
  const saved=localStorage.getItem('lami-doc-'+id);
  document.getElementById('docModalTitle').textContent=doc.name;
  document.getElementById('docModalMeta').innerHTML=`
    <div class="docmeta-item">${doc.type==='PDF'?'📕':'📘'} <b>${doc.type}</b></div>
    <div class="docmeta-item">📚 <b>${doc.level}</b></div>
    <div class="docmeta-item">📖 <b>${doc.mod}</b></div>
    <div class="docmeta-item">📅 <b>${doc.date}</b></div>
    <div class="docmeta-item">💾 <b>${doc.size}</b></div>
  `;
  document.getElementById('docModalContent').value=saved||doc.content||'';
  document.getElementById('docModal').classList.add('show');
}

function closeDocModal(){
  document.getElementById('docModal').classList.remove('show');
  currentDocId=null;
}

function saveDoc(){
  if(!currentDocId)return;
  const content=document.getElementById('docModalContent').value;
  localStorage.setItem('lami-doc-'+currentDocId,content);
  alert('✅ Document sauvegardé !');
  renderDocs();
}

function downloadDoc(){
  if(!currentDocId)return;
  const doc=DOCS.find(d=>d.id===currentDocId);
  const content=document.getElementById('docModalContent').value;
  const blob=new Blob([content],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=doc.name.replace(/[^a-zA-Z0-9]/g,'_')+'.txt';a.click();
  URL.revokeObjectURL(url);
  alert('📥 Fichier téléchargé !');
}

function quickAI(q){
  document.getElementById('aiInput').value=q;
  sendAI();
}

function sendAI(){
  const input=document.getElementById('aiInput');
  const msg=input.value.trim();
  if(!msg)return;
  const box=document.getElementById('chatBox');
  box.innerHTML+=`<div class="chat-msg user"><div class="chat-bubble user-bub">${msg}<div style="font-size:9px;margin-top:4px;opacity:0.6">Maintenant</div></div></div>`;
  input.value='';
  setTimeout(()=>{
    const resp=AI_KB[msg.toLowerCase()]||AI_KB['aide']||"Laissez-moi vous aider. Je peux intervenir sur : Grammaire, Littérature, Méthodologie, Documents. Que souhaitez-vous ?";
    box.innerHTML+=`<div class="chat-msg ai"><div class="chat-bubble"><div class="label">🤖 LamiAI</div>${resp.replace(/\n/g,'<br>')}<div style="font-size:9px;margin-top:4px;opacity:0.5">Maintenant</div></div></div>`;
  },700);
  box.scrollTop=box.scrollHeight;
}

function renderChat(msgs){
  document.getElementById('chatBox').innerHTML=msgs.map(m=>`<div class="chat-msg ${m.sender}"><div class="chat-bubble ${m.sender==='user'?'user-bub':''}">${m.sender==='ai'?'<div class="label">🤖 LamiAI</div>':''}${m.text.replace(/\n/g,'<br>')}<div style="font-size:9px;margin-top:4px;opacity:0.5">${new Date(m.t).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div></div></div>`).join('');
  setTimeout(()=>document.getElementById('chatBox')?.scrollTo({top:document.getElementById('chatBox').scrollHeight,behavior:'smooth'}),50);
}

function generateDoc(type, title, content, author) {
  const blob = { word: () => new Blob([`\nMS-DOC FORMAT - Fichier généré par LamiAI\n================================\nTitre: ${title}\nAuteur: ${author}\nDate: ${new Date().toLocaleDateString('fr-FR')}\n\nCONTENU:\n${content}\n\n----\nDocument généré automatiquement par LamiAI pour le Prof. ${author}`], {type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}),
    excel: () => new Blob([`Nom;Note;Commentaire\nAli;18/20;Excellent travail sur la poésie\nMarie;16/20;Bonne analyse du texte\nSamir;14/20;À revoir la méthode\nFatima;19/20;Très bonne dissertation`], {type:'text/csv'}),
    pdf: () => new Blob([`%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj\n4 0 obj<<>>stream\nBT /F1 12 Tf 100 700 Td (${title}) Tj ET\nBT /F1 10 Tf 50 650 Td (Document généré par LamiAI pour le Prof. ${author} - ${new Date().toLocaleDateString('fr-FR')}) Tj ET\nBT /F1 12 Tf 50 620 Td (${content}) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\ntrailer<</Root 1 0 R/Size 5>>\nstartxref\n72\n%%EOF`], {type:'application/pdf'})
  };
  const ext = {word:'docx',excel:'csv',pdf:'pdf'};
  const name = title.replace(/[^a-zA-Z0-9]/g,'_') + '.' + ext[type];
  const url = URL.createObjectURL(blob[type]());
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
  alert('✅ Fichier ' + ext[type].toUpperCase() + ' créé avec succès !\nTitre : ' + title + '\nTéléchargé : ' + name);
}

function loadEmploi(){
  const body=document.getElementById('emploiBody');
  const stats=document.getElementById('emploiStats');
  if(!body) return;
  let data=JSON.parse(localStorage.getItem('lami-emploi')||'[]');
  if(data.length===0){
    data=[
      {heure:'08:00 - 09:30',dim:'1ère Année - Français',lun:'4ème Année - Subordination',mar:'Bac Lettres - Poésie',mer:'2ème Année - Femme et Société',jeu:'1ère Année - Français',ven:'—'},
      {heure:'09:30 - 10:00',dim:'—',lun:'—',mar:'—',mer:'—',jeu:'—',ven:'—'},
      {heure:'10:00 - 11:30',dim:'2ème Année - Grammaire',lun:'Bac Sciences - Français',mar:'4ème Année - Discours',mer:'1ère Année - Français',jeu:'Bac Lettres - Dissertation',ven:'2ème Sciences - Contrôle'},
      {heure:'11:30 - 14:00',dim:'—',lun:'—',mar:'—',mer:'—',jeu:'—',ven:'—'},
      {heure:'14:00 - 15:30',dim:'4ème Année - Grammaire',lun:'2ème Lettres - Vocabulaire',mar:'1ère Année - Français',mer:'Bac Lettres - Synthèse',jeu:'2ème Sciences - Module 3',ven:'—'},
      {heure:'15:30 - 17:00',dim:'—',lun:'Bac Lettres - Correction',mar:'—',mer:'—',jeu:'4ème Année - Exercices',ven:'—'},
    ];
    localStorage.setItem('lami-emploi',JSON.stringify(data));
  }
  const days=['dim','lun','mar','mer','jeu','ven'];
  const colors={'1ère':'#3b82f6','2ème':'#059669','4ème':'#f59e0b','Bac':'#dc2626','—':'transparent'};
  function getColor(val){
    for(const[k,c]of Object.entries(colors)){if(val.startsWith(k))return c;}
    return '#6b7280';
  }
  body.innerHTML=data.map(r=>`<tr>
    <td style="padding:8px;border:1px solid var(--b);font-weight:700;background:#f8fafc;white-space:nowrap">${r.heure}</td>
    ${days.map(d=>{
      const val=r[d]||'—';
      const c=getColor(val);
      const isEmpty=val==='—'||val===''||val==='—';
      return `<td style="padding:8px;border:1px solid var(--b);text-align:center;${isEmpty?'background:#f8fafc;color:#94a3b8;font-style:italic':'background:#fff;font-weight:600'};cursor:pointer" onclick="editEmploiCell('${r.heure}','${d}')">${isEmpty?'—':val}</td>`;
    }).join('')}
  </tr>`).join('');
  let totalCours=0;
  data.forEach(r=>days.forEach(d=>{if(r[d]&&r[d]!=='—'&&r[d]!=='')totalCours++;}));
  stats.innerHTML=`
    <div style="text-align:center;padding:10px 16px;background:#eff6ff;border-radius:8px"><div style="font-size:22px;font-weight:800;color:#2563eb">${totalCours}</div><div style="font-size:10px;color:var(--tl)">Cours / semaine</div></div>
    <div style="text-align:center;padding:10px 16px;background:#f0fdf4;border-radius:8px"><div style="font-size:22px;font-weight:800;color:#16a34a">${data.length}</div><div style="font-size:10px;color:var(--tl)">Créneaux</div></div>
    <div style="text-align:center;padding:10px 16px;background:#fef2f2;border-radius:8px"><div style="font-size:22px;font-weight:800;color:#dc2626">${data.filter(r=>r.dim?.includes('Contrôle')||r.lun?.includes('Contrôle')||r.mar?.includes('Contrôle')||r.mer?.includes('Contrôle')||r.jeu?.includes('Contrôle')||r.ven?.includes('Contrôle')).length}</div><div style="font-size:10px;color:var(--tl)">Contrôles</div></div>`;
}

function addEmploi(){
  const heure=prompt('Heure du cours (ex: 08:00 - 09:30) :');
  if(!heure)return;
  const classe=prompt('Classe et matière (ex: 1ère Année - Français) :');
  if(!classe)return;
  const jour=prompt('Jour (dim, lun, mar, mer, jeu, ven) :');
  if(!jour)return;
  const j=jour.toLowerCase().trim();
  if(!['dim','lun','mar','mer','jeu','ven'].includes(j)){alert('Jour invalide. Utilisez : dim, lun, mar, mer, jeu, ven');return;}
  let data=JSON.parse(localStorage.getItem('lami-emploi')||'[]');
  let existing=data.find(r=>r.heure===heure);
  if(existing){existing[j]=classe;}
  else{
    const row={heure,dim:'—',lun:'—',mar:'—',mer:'—',jeu:'—',ven:'—'};
    row[j]=classe;
    data.push(row);
    data.sort((a,b)=>{
      const t=a.heure.split(':')[0];const t2=b.heure.split(':')[0];
      return parseInt(t)-parseInt(t2);
    });
  }
  localStorage.setItem('lami-emploi',JSON.stringify(data));
  alert('✅ Emploi du temps ajouté !\n'+heure+' → '+classe+' ('+jour+')');
  loadEmploi();
}

function editEmploiCell(heure,jour){
  const val=prompt('Modifier le cours pour '+heure+' ('+jour+') :\n(Laissez — pour vider)',localStorage.getItem('lami-emploi')?JSON.parse(localStorage.getItem('lami-emploi')).find(r=>r.heure===heure)?.[jour]:'');
  if(val===null)return;
  let data=JSON.parse(localStorage.getItem('lami-emploi')||'[]');
  let existing=data.find(r=>r.heure===heure);
  if(existing){existing[jour]=val||'—';}
  localStorage.setItem('lami-emploi',JSON.stringify(data));
  loadEmploi();
}

function deleteEmploi(){
  const heure=prompt('Supprimer le créneau (heure exacte, ex: 08:00 - 09:30) :\nOu tapez "tout" pour tout effacer.');
  if(!heure)return;
  let data=JSON.parse(localStorage.getItem('lami-emploi')||'[]');
  if(heure.toLowerCase()==='tout'){
    if(confirm("Supprimer TOUT l'emploi du temps ?")){data=[];}
  }else{
    data=data.filter(r=>r.heure!==heure);
  }
  localStorage.setItem('lami-emploi',JSON.stringify(data));
  alert('✅ Élément supprimé.');
  loadEmploi();
}

function exportEmploi(){
  let data=JSON.parse(localStorage.getItem('lami-emploi')||'[]');
  if(data.length===0){alert('Aucun emploi du temps à exporter.');return;}
  const days=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi'];
  const keys=['dim','lun','mar','mer','jeu','ven'];
  let csv='Heure;'+days.join(';')+'\n';
  data.forEach(r=>{csv+=r.heure+';'+keys.map(k=>r[k]||'—').join(';')+'\n';});
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='Emploi_du_Temps_Lamia_Gnaba.csv';a.click();
  URL.revokeObjectURL(url);
  alert('✅ Fichier CSV exporté !\nOuvrez avec Excel pour un rendu parfait.');
}

// Init
showPage('home');

