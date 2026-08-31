import React, { useState, useRef, useEffect, useCallback } from 'react';

const COLORS = {
  primary: '#1e40af', primaryLight: '#3b82f6', primaryDark: '#1e3a8a',
  secondary: '#059669', accent: '#7c3aed', danger: '#dc2626',
  warning: '#f59e0b', bg: '#f0f4f8', card: '#ffffff',
  text: '#1f2937', textLight: '#6b7280', border: '#e5e7eb', sidebar: '#0f172a',
};

const DB_KEY = 'lami-ai-data';

function loadData() {
  try {
    const d = localStorage.getItem(DB_KEY);
    return d ? JSON.parse(d) : null;
  } catch { return null; }
}

function saveData(data) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(data)); } catch {}
}

const DEFAULT_DOCUMENTS = [
  { id: 1, name: "DEVOIR DE CONTROLE N°1 - Français", type: "PDF", level: "1ère Année", module: "Module 1", date: "2026", size: "171 KB", category: "controle" },
  { id: 2, name: "4ème année Lettres - Répartition Modulaire", type: "DOCX", level: "4ème Année", module: "Module 1", date: "2026", size: "41 KB", category: "cours" },
  { id: 3, name: "Fiche la subordination", type: "DOCX", level: "4ème Année", module: "Module 1", date: "2026", size: "26 KB", category: "fiche" },
  { id: 4, name: "Module I - Page de garde", type: "DOCX", level: "4ème Année", module: "Module 1", date: "2026", size: "87 KB", category: "cours" },
  { id: 5, name: "Fiche discours direct", type: "DOCX", level: "4ème Année", module: "Module 1", date: "2026", size: "26 KB", category: "fiche" },
  { id: 6, name: "Dev synthèse 3 - 2ème année", type: "DOCX", level: "2ème Année", module: "Synthèse 3", date: "2025", size: "21 KB", category: "synthese" },
  { id: 7, name: "Dev synt 1 - Bac Lettres 2", type: "DOCX", level: "Bac Lettres", module: "Synthèse 1", date: "2025", size: "18 KB", category: "synthese" },
  { id: 8, name: "Femme et Société - Devoir", type: "DOCX", level: "2ème Année", module: "Femme et Société", date: "2025", size: "43 KB", category: "controle" },
  { id: 9, name: "Dev synt 2 - Bac Blanc 2021 4L", type: "DOCX", level: "Bac Lettres", module: "Synthèse 2", date: "2021", size: "35 KB", category: "synthese" },
  { id: 10, name: "Devoir Contrôle N°2 - Français - 2ème Sciences", type: "PDF", level: "2ème Sciences", module: "Module 2", date: "2014", size: "110 KB", category: "controle" },
  { id: 11, name: "Devoir de synthèse Bac Lettres 2", type: "DOCX", level: "Bac Lettres", module: "Synthèse 2", date: "2025", size: "20 KB", category: "synthese" },
  { id: 12, name: "Devoir Mod 3 - 2ème année", type: "DOCX", level: "2ème Année", module: "Module 3", date: "2025", size: "26 KB", category: "controle" },
  { id: 13, name: "Devoir 2ème travail - L'interdit", type: "DOCX", level: "2ème Année", module: "Module 1", date: "2025", size: "18 KB", category: "controle" },
  { id: 14, name: "Devoir Femme et Société 1", type: "DOCX", level: "2ème Année", module: "Femme et Société", date: "2025", size: "27 KB", category: "controle" },
  { id: 15, name: "Devoir Travail 2ème - L'interdit", type: "DOC", level: "2ème Année", module: "Module 1", date: "2025", size: "41 KB", category: "controle" },
  { id: 16, name: "Exercice 2ème Module 3", type: "DOCX", level: "2ème Année", module: "Module 3", date: "2025", size: "22 KB", category: "exercice" },
  { id: 17, name: "Expression Femme et Société", type: "DOC", level: "2ème Année", module: "Femme et Société", date: "2025", size: "34 KB", category: "expression" },
  { id: 18, name: "Vocabulaire 2ème Mod 3", type: "DOCX", level: "2ème Année", module: "Module 3", date: "2025", size: "22 KB", category: "vocabulaire" },
  { id: 19, name: "Biographie de Simone de Beauvoir", type: "DOCX", level: "4ème Année", module: "Femme et Société", date: "2025", size: "16 KB", category: "cours" },
  { id: 20, name: "Révision 2ème année", type: "DOCX", level: "2ème Année", module: "Révision", date: "2025", size: "15 KB", category: "revision" },
  { id: 21, name: "Test diagnostique 1ère", type: "DOCX", level: "1ère Année", module: "Diagnostique", date: "2025", size: "23 KB", category: "diagnostique" },
  { id: 22, name: "Test diagnostique 3ème", type: "DOCX", level: "3ème Année", module: "Diagnostique", date: "2025", size: "23 KB", category: "diagnostique" },
  { id: 23, name: "Évaluation 4ème année", type: "DOCX", level: "4ème Année", module: "Évaluation", date: "2025", size: "28 KB", category: "evaluation" },
  { id: 24, name: "Fiche pédagogique - Travail et Bien-être", type: "DOCX", level: "4ème Année", module: "Module 4", date: "2025", size: "18 KB", category: "fiche" },
  { id: 25, name: "Module Travail et Bien-être", type: "DOCX", level: "4ème Année", module: "Module 4", date: "2025", size: "24 KB", category: "cours" },
  { id: 26, name: "Répartition du module", type: "DOCX", level: "4ème Année", module: "Module 4", date: "2025", size: "16 KB", category: "cours" },
  { id: 27, name: "Fiche expression 2", type: "DOCX", level: "2ème Année", module: "Expression", date: "2025", size: "16 KB", category: "fiche" },
  { id: 28, name: "Comment argumenter", type: "DOCX", level: "Bac Lettres", module: "Méthodologie", date: "2024", size: "25 KB", category: "methodologie" },
  { id: 29, name: "Compréhension de texte", type: "DOCX", level: "2ème Année", module: "Compréhension", date: "2024", size: "16 KB", category: "exercice" },
  { id: 30, name: "Conjugaison", type: "DOCX", level: "2ème Année", module: "Grammaire", date: "2025", size: "17 KB", category: "grammaire" },
  { id: 31, name: "Correction devoir synthèse III", type: "DOCX", level: "Bac Lettres", module: "Synthèse 3", date: "2025", size: "17 KB", category: "correction" },
  { id: 32, name: "Devoir 2ème Mod Amour", type: "DOCX", level: "2ème Année", module: "Amour", date: "2025", size: "21 KB", category: "controle" },
  { id: 33, name: "Devoir Bac Lettres Mod 3", type: "DOCX", level: "Bac Lettres", module: "Module 3", date: "2025", size: "27 KB", category: "controle" },
  { id: 34, name: "Devoir Guerre", type: "DOCX", level: "2ème Année", module: "Guerre", date: "2025", size: "18 KB", category: "controle" },
  { id: 35, name: "Étude de texte 2ème année", type: "DOCX", level: "2ème Année", module: "Étude de texte", date: "2025", size: "27 KB", category: "etude" },
  { id: 36, name: "Expression libre", type: "DOCX", level: "Bac Lettres", module: "Expression", date: "2025", size: "26 KB", category: "expression" },
  { id: 37, name: "Module Modernité - Devoir", type: "DOCX", level: "Bac Lettres", module: "Modernité", date: "2025", size: "28 KB", category: "controle" },
  { id: 38, name: "Révision Bac Scientifiques", type: "DOCX", level: "Bac Sciences", module: "Révision", date: "2025", size: "18 KB", category: "revision" },
  { id: 39, name: "Subordination 4ème L", type: "DOCX", level: "4ème Année", module: "Module 1", date: "2025", size: "2046 KB", category: "fiche" },
  { id: 40, name: "Le conditionnel 2ème année", type: "DOCX", level: "2ème Année", module: "Grammaire", date: "2025", size: "17 KB", category: "grammaire" },
  { id: 41, name: "Les rapports logiques", type: "DOCX", level: "2ème Année", module: "Grammaire", date: "2025", size: "16 KB", category: "grammaire" },
  { id: 42, name: "Les types et formes de phrases", type: "DOCX", level: "2ème Année", module: "Grammaire", date: "2025", size: "13 KB", category: "grammaire" },
  { id: 43, name: "Concordance des temps - Bac", type: "DOCX", level: "Bac Lettres", module: "Grammaire", date: "2025", size: "21 KB", category: "grammaire" },
  { id: 44, name: "Tableau Figures de Style", type: "DOCX", level: "Général", module: "Figures de style", date: "2025", size: "17 KB", category: "grammaire" },
  { id: 45, name: "Exercice Figures de style", type: "DOCX", level: "2ème Année", module: "Figures de style", date: "2025", size: "14 KB", category: "exercice" },
  { id: 46, name: "Module Poésie", type: "DOCX", level: "Bac Lettres", module: "Poésie", date: "2025", size: "26 KB", category: "cours" },
  { id: 47, name: "Poème Barbara - Bac L", type: "DOCX", level: "Bac Lettres", module: "Poésie", date: "2025", size: "15 KB", category: "cours" },
  { id: 48, name: "Versification et formes poétiques", type: "DOCX", level: "Bac Lettres", module: "Poésie", date: "2025", size: "29 KB", category: "cours" },
  { id: 49, name: "Tonalités ou Registres", type: "DOCX", level: "Bac Lettres", module: "Tonalités", date: "2025", size: "189 KB", category: "cours" },
  { id: 50, name: "Dissertation sur la poésie", type: "DOCX", level: "Bac Lettres", module: "Dissertation", date: "2025", size: "24 KB", category: "dissertation" },
];

const LEVELS = [
  { id: '1ere', name: '1ère Année', color: '#3b82f6', count: 3, icon: '📖' },
  { id: '2eme', name: '2ème Année', color: '#059669', count: 25, icon: '📚' },
  { id: '2eme-sci', name: '2ème Sciences', color: '#8b5cf6', count: 1, icon: '🔬' },
  { id: '2eme-let', name: '2ème Lettres', color: '#ec4899', count: 2, icon: '📝' },
  { id: '4eme', name: '4ème Année', color: '#f59e0b', count: 10, icon: '🎓' },
  { id: 'bac-let', name: 'Bac Lettres', color: '#dc2626', count: 12, icon: '🏆' },
  { id: 'bac-sci', name: 'Bac Sciences', color: '#0891b2', count: 1, icon: '🧬' },
];

const AI_KB = {
  'bonjour': "Bonjour ! Je suis **LamiAI**, assistant pédagogique de la Prof. Lamia Gnaba. Comment puis-je vous aider ?",
  'salut': "Salut ! Ravi de vous aider. Posez-moi vos questions sur le français !",
  'aide': "Je peux vous aider avec :\n📚 Gestion des 100 documents\n📝 Grammaire (subordination, discours, etc.)\n📖 Littérature et poésie\n🎯 Méthodologie Bac\n📋 Exercices pratiques\nQue voulez-vous savoir ?",
  'grammaire': "Voici les sujets grammaticaux couverts :\n\n▸ **Subordination** (4ème Année)\n- Complétive, relative, circonstancielle\n\n▸ **Discours direct/indirect** (2ème, 4ème)\n- Transformation, concordance des temps\n\n▸ **Conditionnel** (2ème Année)\n- Formation et emplois\n\n▸ **Rapports logiques** (2ème Année)\n- Connecteurs logiques\n\n▸ **Types de phrases** (2ème Année)\n- Simple, complexe, composée\n\nQuel sujet vous intéresse ?",
  'subordination': "La **subordination** est un module clé en 4ème Année.\n\n**Types de propositions :**\n\n1️⃣ **Complétive** (introduite par *que*, *si*)\n   → \"Il sentait *qu'elle n'était pas assez forte*\"\n\n2️⃣ **Relative** (introduite par un pronom relatif)\n   → \"La fenêtre *qui donnait sur la route*\"\n\n3️⃣ **Circonstancielle** (conjonction de subordination)\n   → \"*Quand il eut fini sa tâche*, il s'en alla\"\n\n4️⃣ **Interrogative indirecte**\n   → \"Il se demandait *comment l'abandonner*\"\n\n**Exercices :**\n- Souligner les propositions subordonnées\n- Identifier le type de subordination\n- Remplacer par la locution conjonctive adéquate\n\nVoulez-vous des exercices pratiques ?",
  'discours': "Le **discours direct et indirect** est abordé en 2ème Année.\n\n**Discours direct :**\nParole entre guillemets, telle quelle.\n→ Philinte dit : \"Vous voulez un grand mal !\"\n\n**Discours indirect :**\nParole reformulée avec *que*.\n→ Philinte dit qu'on veut un grand mal.\n\n**Transformations :**\n✅ Supprimer les guillemets\n✅ Ajouter *que*\n✅ Concorner les temps (si verbe au passé)\n✅ Modifier temps/lieu\n\n**Tableau concordance :**\n- Présent → Imparfait\n- Futur → Conditionnel\n- Passé composé → Plus-que-parfait\n\nVoulez-vous des exercices de transformation ?",
  'dissertation': "La **dissertation** est essentielle au Bac Lettres.\n\n**Structure obligatoire :**\n\n📝 **Introduction** (~1/6)\n- Amorce / accroche\n- Présentation du sujet\n- Problématique\n- Annonce du plan\n\n📖 **Développement** (~4/6)\n- 2 ou 3 parties\n- Arguments + exemples\n- Citations des textes\n- Analyse littéraire\n\n🎯 **Conclusion** (~1/6)\n- Réponse à la problématique\n- Ouverture\n\n**Conseils Prof. Gnaba :**\n- Lire le sujet 3 fois\n- Faire un plan détaillé\n- Utiliser le vocabulaire litteraire\n- Citer les textes étudiés\n- Relire et corriger",
  'poésie': "La **poésie** est un module majeur au Bac Lettres.\n\n**Versification :**\n- Rimes (plates, croisées, embrassées)\n- Rythme et prosodie\n- Strophes (quatrain, tercet, distique)\n\n**Figures poétiques :**\n- Métaphore, comparaison\n- Personification, hyperbole\n- Allitération, assonance\n\n**Textes étudiés :**\n- \"Barbara\" de Prévert\n- \"Que les poètes\"\n\n**Méthodologie analyse :**\n1. Présenter le poète\n2. Thème du poème\n3. Structure\n4. Procédés littéraires\n5. Sens et interprétation",
  'expression': "L'**expression écrite** comprend :\n\n✍️ **Expression libre** : texte sur un thème\n✍️ **Expression guidée** : consignes précises\n✍️ **Récit** : histoire avec problématique\n\n**Thèmes courants :**\n- Femme et Société\n- Amour et relations\n- Guerre et paix\n- Travail et bien-être\n- Tradition et modernité\n\n**Conseils :**\n1. Lire et comprendre le sujet\n2. Plan détaillé\n3. Vocabulaire riche\n4. Soigner grammaire/orthographe\n5. Relire et corriger",
  'methodologie': "La **méthodologie** est centrale :\n\n**Comment argumenter :**\n- Identifier thèse/antithèse\n- Arguments + exemples\n- Structurer le raisonnement\n\n**Étude de texte :**\n1. Auteur et œuvre\n2. Résumé\n3. Procédés littéraires\n4. Sens global\n\n**Préparation Bac :**\n- Dissertation\n- Synthèse de textes\n- Analyse de documents",
  'documents': "La Prof. Gnaba possède **100 documents** :\n\n📋 **Par type :**\n- Contrôles\n- Cours\n- Fiches pédagogiques\n- Exercices\n- Révisions\n- Synthèses\n- Corrections\n\n📚 **Par niveau :**\n- 1ère Année\n- 2ème Année\n- 4ème Année\n- Bac Lettres\n- Bac Sciences\n\nRecherchez par nom ou module !",
  'femme': "Le module **Femme et Société** est central :\n\n📖 **Textes :**\n- Gisèle Halimi \"Ne vous résignez jamais\"\n- Simone de Beauvoir \"Le deuxième sexe\"\n\n📝 **Objectifs :**\n- Condition féminine\n- Discours engagés\n- Esprit critique\n\n✏️ **Exercices :**\n- Compréhension\n- Analyse lexicale\n- Expression écrite",
  'bac': "Préparation au **Bac** :\n\n🎯 **Épreuves :**\n- Dissertation (4h)\n- Synthèse (3h)\n- Expression (2h)\n\n📚 **Modules :**\n- Poésie et versification\n- Modernité et tradition\n- Engagement\n- Tonalités\n\n📝 **Sujets types :**\n- Dissertation\n- Analyse de poème\n- Synthèse de textes",
  'conditionnel': "Le **conditionnel** (2ème Année) :\n\n📋 **Formation :**\nFutur + imparfait (avoir/être)\n\n📝 **Exemples :**\n- Je serais\n- Tu aurais\n- Il ferait\n- Nous aimerions\n\n✏️ **Emplois :**\n- Politesse\n- Hypothèse (si + imp.)\n- Souhait\n\n🎓 **Concordance :**\n- Si + imp. → cond. présent\n- Si + plus-que-par. → cond. passé",
  'figures': "Les **figures de style** (2ème Année) :\n\n🎨 **Figures :**\n- Comparaison : \"Pareil à un ciel...\"\n- Métaphore : \"rendu l'âme\"\n- Personification : \"les arbres nous couraient\"\n- Hyperbole : \"mille choses\"\n- Litote : \"c'est pas mal\"\n- Antithèse : \"jour et nuit\"\n- Allitération : consonnes\n- Assonance : voyelles\n\n📝 **Exercices :**\n- Identifier la figure\n- Expliquer l'effet\n- Créer des phrases",
  'vocabulaire': "Enrichissement **lexical** :\n\n📖 **Mots clés par module :**\n- Femme et Société : archaïque, asservi, misogynie\n- Travail : labeur, pénible, assidu\n- Amour : passion, dévouement, tendresse\n\n✏️ **Exercices :**\n- Synonymes/antonymes\n- Textes à trous\n- Associations de mots\n- Définitions",
  'merci': "De rien ! Je suis là pour vous aider. N'hésitez pas !",
  'au revoir': "Au revoir ! Bonne continuation ! 👋",
};

function getAIResponse(msg) {
  const l = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [key, resp] of Object.entries(AI_KB)) {
    const nk = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (l.includes(nk)) return resp;
  }
  return "Laissez-moi vous aider. Je peux intervenir sur :\n\n📚 Grammaire (subordination, discours, etc.)\n📖 Littérature (poésie, dissertation)\n✏️ Expression et rédaction\n🎯 Méthodologie Bac\n📋 Recherche de documents\n\nQue souhaitez-vous savoir ?";
}

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

const S = {
  app: { display: 'flex', minHeight: '100vh', background: COLORS.bg },
  sidebar: (open) => ({
    width: open ? 260 : 0, minWidth: open ? 260 : 0, background: COLORS.sidebar, color: '#fff',
    display: 'flex', flexDirection: 'column', height: '100vh', position: 'fixed', zIndex: 200,
    transition: 'all 0.3s', overflow: 'hidden',
  }),
  sidebarOpen: { width: 260, minWidth: 260 },
  main: (sidebarOpen) => ({ marginLeft: sidebarOpen ? 260 : 0, flex: 1, minHeight: '100vh', transition: 'margin 0.3s' }),
  topBar: { background: '#fff', padding: '12px 24px', borderBottom: `1px solid ${COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  content: { padding: '20px 24px', maxWidth: 1400 },
  card: { background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: 16 },
  btn: { padding: '8px 16px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13, transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: 6 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 13, outline: 'none' },
  tag: { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
};

const NAV = [
  { id: 'home', icon: '🏠', label: 'Accueil' },
  { id: 'docs', icon: '📄', label: 'Documents' },
  { id: 'ai', icon: '🤖', label: 'Assistant IA' },
  { id: 'calendar', icon: '📅', label: 'Emploi du Temps' },
  { id: 'courses', icon: '📚', label: 'Cours' },
  { id: 'levels', icon: '🎯', label: 'Niveaux' },
  { id: 'exercises', icon: '✏️', label: 'Exercices' },
  { id: 'settings', icon: '⚙️', label: 'Paramètres' },
];

function Sidebar({ page, setPage, open, setOpen }) {
  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199 }} />}
      <div style={{ ...S.sidebar(true), ...(open ? S.sidebarOpen : {}) }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>L</div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>LamiAI</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>Prof. Lamia Gnaba</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV.map(n => (
            <div key={n.id}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', margin: '2px 8px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: page === n.id ? '#fff' : '#cbd5e1', background: page === n.id ? COLORS.primaryLight : 'transparent', transition: 'all 0.15s' }}
              onClick={() => { setPage(n.id); setOpen(false); }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span> {n.label}
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 10, color: '#475569' }}>LamiAI v1.0 • PWA</div>
          <div style={{ fontSize: 10, color: '#64748b' }}>PC + Android synchronisés</div>
        </div>
      </div>
    </>
  );
}

function TopBar({ title, sub, onMenu }) {
  const [synced, setSynced] = useState(true);
  useEffect(() => {
    const h = () => setSynced(false);
    const h2 = () => setSynced(true);
    window.addEventListener('online', h2);
    window.addEventListener('offline', h);
    return () => { window.removeEventListener('online', h2); window.removeEventListener('offline', h); };
  }, []);
  return (
    <div style={S.topBar}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenu} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4 }}>☰</button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>{title}</h1>
          {sub && <p style={{ fontSize: 11, color: COLORS.textLight }}>{sub}</p>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: synced ? '#22c55e' : '#ef4444' }} title={synced ? 'Synchronisé' : 'Hors ligne'} />
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: COLORS.textLight }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.primary }}>Prof. Lamia Gnaba</div>
        </div>
      </div>
    </div>
  );
}

function HomePage({ setPage }) {
  const docs = useLocalStorage('lami-docs', DEFAULT_DOCUMENTS)[0];
  return (
    <div className="fade-in">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '📄', val: docs.length, label: 'Documents', c: COLORS.primary },
          { icon: '📚', val: 7, label: 'Niveaux', c: COLORS.secondary },
          { icon: '📋', val: '25+', label: 'Modules', c: COLORS.accent },
          { icon: '🎓', val: '2026', label: 'Année', c: COLORS.warning },
        ].map((s, i) => (
          <div key={i} style={{ ...S.card, textAlign: 'center', padding: 16 }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.c }}>{s.val}</div>
            <div style={{ fontSize: 11, color: COLORS.textLight }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { icon: '🤖', label: 'Assistant IA', desc: 'Questions/réponses', c: COLORS.primary, page: 'ai' },
          { icon: '📄', label: 'Documents', desc: `${docs.length} fichiers`, c: COLORS.secondary, page: 'docs' },
          { icon: '✏️', label: 'Exercices', desc: '8 exercices', c: COLORS.accent, page: 'exercises' },
          { icon: '📅', label: 'Emploi du Temps', desc: 'Planning', c: COLORS.warning, page: 'calendar' },
        ].map((a, i) => (
          <div key={i} onClick={() => setPage(a.page)} style={{ ...S.card, cursor: 'pointer', borderLeft: `3px solid ${a.c}`, transition: 'transform 0.15s' }}
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 32 }}>{a.icon}</div>
              <div><div style={{ fontSize: 15, fontWeight: 700 }}>{a.label}</div><div style={{ fontSize: 11, color: COLORS.textLight }}>{a.desc}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📄 Documents Récents</h3>
        {docs.slice(0, 5).map(d => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.border}` }}>
            <span style={{ fontSize: 20, marginRight: 10 }}>{d.type === 'PDF' ? '📕' : '📘'}</span>
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div><div style={{ fontSize: 11, color: COLORS.textLight }}>{d.level} • {d.module}</div></div>
            <span style={{ ...S.tag, background: d.type === 'PDF' ? '#fef2f2' : '#eff6ff', color: d.type === 'PDF' ? '#dc2626' : '#2563eb' }}>{d.type}</span>
          </div>
        ))}
      </div>

      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>💡 À Propos</h3>
        <p style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.6 }}>
          LamiAI est un assistant pédagogique pour le Prof. Lamia Gnaba. Fonctionne sur <strong>PC</strong> et <strong>Android</strong> simultanément avec synchronisation automatique.
        </p>
      </div>
    </div>
  );
}

function DocsPage() {
  const [docs] = useLocalStorage('lami-docs', DEFAULT_DOCUMENTS);
  const [search, setSearch] = useState('');
  const [fLevel, setFLevel] = useState('Tous');
  const [fType, setFType] = useState('Tous');
  const levels = ['Tous', ...new Set(docs.map(d => d.level))];
  const types = ['Tous', 'controle', 'cours', 'fiche', 'exercice', 'synthese', 'revision', 'vocabulaire', 'grammaire', 'expression', 'etude', 'methodologie', 'evaluation', 'diagnostique', 'dissertation', 'correction'];
  const tl = { controle: 'Contrôle', cours: 'Cours', fiche: 'Fiche', exercice: 'Exercice', synthese: 'Synthèse', revision: 'Révision', vocabulaire: 'Vocabulaire', grammaire: 'Grammaire', expression: 'Expression', etude: 'Étude', methodologie: 'Méthodologie', evaluation: 'Évaluation', diagnostique: 'Diagnostique', dissertation: 'Dissertation', correction: 'Correction' };
  const filtered = docs.filter(d => {
    const s = d.name.toLowerCase().includes(search.toLowerCase()) || d.module.toLowerCase().includes(search.toLowerCase());
    const l = fLevel === 'Tous' || d.level === fLevel;
    const t = fType === 'Tous' || d.category === fType;
    return s && l && t;
  });

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <input style={{ ...S.input, paddingLeft: 34 }} placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ position: 'absolute', left: 10, top: 9, fontSize: 14 }}>🔍</span>
        </div>
        <select style={{ ...S.input, width: 160 }} value={fLevel} onChange={e => setFLevel(e.target.value)}>
          {levels.map(l => <option key={l}>{l}</option>)}
        </select>
        <select style={{ ...S.input, width: 160 }} value={fType} onChange={e => setFType(e.target.value)}>
          {types.map(t => <option key={t}>{tl[t] || t}</option>)}
        </select>
      </div>
      <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 12 }}>{filtered.length} document(s)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map(d => (
          <div key={d.id} style={{ ...S.card, display: 'flex', gap: 12, padding: 14 }}>
            <span style={{ fontSize: 28 }}>{d.type === 'PDF' ? '📕' : '📘'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
              <div style={{ fontSize: 11, color: COLORS.textLight, marginTop: 2 }}>{d.level} • {d.module} • {d.size}</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                <span style={{ ...S.tag, background: '#eff6ff', color: '#2563eb' }}>{d.level}</span>
                <span style={{ ...S.tag, background: '#f0fdf4', color: '#16a34a' }}>{d.module}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIPage() {
  const [msgs, setMsgs] = useLocalStorage('lami-ai-msgs', [{ id: 1, text: "Bonjour ! Je suis LamiAI. Comment puis-je vous aider ?", sender: 'ai', t: Date.now() }]);
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);
  const send = () => {
    if (!input.trim()) return;
    const m = { id: Date.now(), text: input, sender: 'user', t: Date.now() };
    setMsgs(p => [...p, m]); setInput('');
    setTimeout(() => {
      setMsgs(p => [...p, { id: Date.now() + 1, text: getAIResponse(input), sender: 'ai', t: Date.now() }]);
    }, 600);
  };
  const quicks = ['Bonjour', 'Aide', 'Grammaire', 'Subordination', 'Discours', 'Dissertation', 'Poésie', 'Bac', 'Figures de style', 'Conditionnel', 'Vocabulaire', 'Documents'];

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 100px)' }}>
      <div style={{ flex: 1, overflow: 'auto', paddingBottom: 12 }}>
        {msgs.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
            <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: 14, background: m.sender === 'user' ? COLORS.primary : '#fff', color: m.sender === 'user' ? '#fff' : COLORS.text, boxShadow: '0 1px 2px rgba(0,0,0,0.08)', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {m.sender === 'ai' && <div style={{ fontSize: 11, color: COLORS.primaryLight, fontWeight: 700, marginBottom: 4 }}>🤖 LamiAI</div>}
              {m.text}
              <div style={{ fontSize: 9, marginTop: 4, opacity: 0.5 }}>{new Date(m.t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {quicks.map((q, i) => (
          <button key={i} onClick={() => { setInput(q); setTimeout(send, 50); }}
            style={{ padding: '5px 10px', borderRadius: 16, border: `1px solid ${COLORS.border}`, background: '#fff', cursor: 'pointer', fontSize: 11, color: COLORS.primary, fontWeight: 500 }}>{q}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={{ ...S.input, flex: 1 }} placeholder="Message..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        <button onClick={send} style={{ ...S.btn, background: COLORS.primary, color: '#fff' }}>📤 Envoyer</button>
      </div>
    </div>
  );
}

function CalendarPage() {
  const events = [
    { t: 'Cours Français 1ère', h: '08:00-09:30', c: 'cours', color: COLORS.primary },
    { t: 'Contrôle 2ème - Femme et Société', h: '10:00-11:30', c: 'examen', color: COLORS.danger },
    { t: 'Cours Grammaire 4ème - Subordination', h: '14:00-15:30', c: 'cours', color: COLORS.secondary },
    { t: 'Correction Bac Lettres', h: '16:00-17:00', c: 'correction', color: COLORS.warning },
    { t: 'Cours Poésie Bac', h: '08:00-09:30', c: 'cours', color: COLORS.primary },
    { t: 'Synthèse 2ème Lettres', h: '10:00-11:30', c: 'examen', color: COLORS.danger },
  ];
  const now = new Date();
  const months = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const days = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{months[now.getMonth()]} {now.getFullYear()}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, textAlign: 'center' }}>
          {days.map(d => <div key={d} style={{ fontSize: 10, fontWeight: 700, color: COLORS.textLight, padding: 4 }}>{d}</div>)}
          {Array.from({ length: 35 }, (_, i) => {
            const dn = i - new Date(now.getFullYear(), now.getMonth(), 1).getDay() + 1;
            const cur = dn === now.getDate();
            const ok = dn > 0 && dn <= new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            return <div key={i} style={{ padding: 8, borderRadius: 6, fontSize: 12, fontWeight: cur ? 700 : 400, background: cur ? COLORS.primary : 'transparent', color: cur ? '#fff' : ok ? COLORS.text : '#d1d5db' }}>{ok ? dn : ''}</div>;
          })}
        </div>
      </div>
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🕐 Emploi du Temps</h3>
        {events.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ width: 3, height: 32, borderRadius: 2, background: e.color, marginRight: 10 }} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{e.t}</div><div style={{ fontSize: 11, color: COLORS.textLight }}>{e.h}</div></div>
            <span style={{ ...S.tag, background: e.c === 'cours' ? '#eff6ff' : e.c === 'examen' ? '#fef2f2' : '#f0fdf4', color: e.c === 'cours' ? '#2563eb' : e.c === 'examen' ? '#dc2626' : '#16a34a' }}>{e.c === 'cours' ? 'Cours' : e.c === 'examen' ? 'Examen' : 'Correction'}</span>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Résumé</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: COLORS.textLight }}>Cours</span><span style={{ fontWeight: 700, color: COLORS.primary }}>3</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: COLORS.textLight }}>Contrôles</span><span style={{ fontWeight: 700, color: COLORS.danger }}>2</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: 12, color: COLORS.textLight }}>Corrections</span><span style={{ fontWeight: 700, color: COLORS.warning }}>1</span></div>
        </div>
        <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: '#fef2f2', fontSize: 12 }}>
          <div style={{ fontWeight: 600, color: COLORS.danger }}>⚠️ Rappel : Contrôle demain</div>
          <div style={{ color: COLORS.textLight, marginTop: 4 }}>2ème Année - Femme et Société</div>
        </div>
      </div>
    </div>
  );
}

function CoursesPage() {
  const [sel, setSel] = useState(null);
  const data = {
    '1ère Année': [{ n: 'Module 1', d: 'Fondamentaux', docs: ['Test diagnostique 1ère'] }, { n: 'Module 5', d: 'Approfondissement', docs: ['Texte 1ère année'] }],
    '2ème Année': [{ n: 'Femme et Société', d: 'Condition féminine', docs: ['Devoir Femme et Société', 'Vocabulaire Mod 3'] }, { n: 'Grammaire', d: 'Conditionnel, rapports logiques', docs: ['Le conditionnel', 'Rapports logiques'] }, { n: 'Figures de style', d: 'Procédés littéraires', docs: ['Exercice Figures de style'] }, { n: 'Synthèse', d: 'Synthèse de textes', docs: ['Dev synthèse 3'] }],
    '4ème Année': [{ n: 'Subordination', d: 'Propositions subordonnées', docs: ['Fiche subordination', 'Subordination 4ème L'] }, { n: 'Discours direct', d: 'Discours rapporté', docs: ['Fiche discours direct'] }, { n: 'Travail et Bien-être', d: 'Module 4', docs: ['Fiche pédagogique', 'Module Travail'] }],
    'Bac Lettres': [{ n: 'Poésie', d: 'Analyse poetique', docs: ['Module Poésie', 'Barbara', 'Versification'] }, { n: 'Dissertation', d: 'Méthodologie', docs: ['Dissertation poésie'] }, { n: 'Tonalités', d: 'Registres', docs: ['Tonalités ou Registres'] }],
    'Bac Sciences': [{ n: 'Révision', d: 'Général', docs: ['Révision Bac Scientifiques'] }],
  };

  if (sel) {
    const mods = data[sel] || [];
    return (
      <div className="fade-in">
        <button onClick={() => setSel(null)} style={{ ...S.btn, background: '#f3f4f6', color: COLORS.text, marginBottom: 16 }}>◀ Retour</button>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>{sel}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {mods.map((m, i) => (
            <div key={i} style={S.card}>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary, marginBottom: 4 }}>{m.n}</div>
              <div style={{ fontSize: 12, color: COLORS.textLight, marginBottom: 8 }}>{m.d}</div>
              {m.docs.map((d, j) => <div key={j} style={{ fontSize: 12, color: COLORS.textLight, padding: '3px 0', borderBottom: `1px solid ${COLORS.border}` }}>📄 {d}</div>)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Mes Cours</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
        {LEVELS.map(l => (
          <div key={l.id} onClick={() => setSel(l.name)} style={{ ...S.card, cursor: 'pointer', borderTop: `3px solid ${l.color}`, transition: 'transform 0.15s' }}
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>{l.icon}</span>
              <div><div style={{ fontSize: 16, fontWeight: 700 }}>{l.name}</div><div style={{ fontSize: 11, color: COLORS.textLight }}>{l.count} docs</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LevelsPage() {
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Mes Niveaux</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {LEVELS.map(l => (
          <div key={l.id} style={{ ...S.card, borderTop: `3px solid ${l.color}` }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{l.icon}</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{l.name}</h3>
            <div style={{ fontSize: 12, color: COLORS.textLight }}>{l.count} documents</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExercisesPage() {
  const [sel, setSel] = useState(null);
  const exs = [
    { id: 1, t: 'Subordination', l: '4ème Année', m: 'Module 1', q: 3, d: 'Identifier les propositions subordonnées' },
    { id: 2, t: 'Discours Direct/Indirect', l: '4ème Année', m: 'Module 1', q: 3, d: 'Transformer le discours' },
    { id: 3, t: 'Vocabulaire Femme et Société', l: '2ème Année', m: 'Femme et Société', q: 3, d: 'Mots du champ lexical' },
    { id: 4, t: 'Figures de Style', l: '2ème Année', m: 'Figures de style', q: 4, d: 'Identifier les figures' },
    { id: 5, t: 'Conditionnel', l: '2ème Année', m: 'Grammaire', q: 5, d: 'Conjuguer au conditionnel' },
    { id: 6, t: 'Rapports Logiques', l: '2ème Année', m: 'Grammaire', q: 4, d: 'Compléter les connecteurs' },
    { id: 7, t: 'Nominalisation Bac', l: 'Bac Lettres', m: 'Nominalisation', q: 3, d: 'Nominaliser les phrases' },
    { id: 8, t: 'Dissertation', l: 'Bac Lettres', m: 'Dissertation', q: 1, d: 'Plan de dissertation' },
  ];
  const contents = {
    1: { title: 'Subordination', intro: 'Il sentait qu\'elle n\'était pas assez forte pour être seule, alors il s\'asseyait à côté d\'elle près de la fenêtre ouverte qui donnait sur la route.', qs: ['Relevez la subordonnée complétive', 'Relevez la subordonnée relative', 'Classez les propositions'] },
    2: { title: 'Discours', intro: 'Philinte : "Vous voulez un grand mal à la nature humaine !"', qs: ['Transformez au discours indirect', 'Qu\'avez-vous modifié ?', 'Exemple avec verbe au passé'] },
    3: { title: 'Vocabulaire', intro: 'Complétez par les mots proposés.', qs: ['Notre voisin est ... et ...', 'La femme vivait dans une société ...', 'La ... est une idéologie'] },
    4: { title: 'Figures de style', intro: 'Identifiez la figure de style.', qs: ['"Pareil à un ciel étoilé, ses yeux brillaient"', '"L\'auteur a rendu l\'âme"', '"Elle avait des lacs de larmes"', '"Les arbres nous couraient après"'] },
    5: { title: 'Conditionnel', intro: 'Conjuguez au conditionnel présent.', qs: ['Être (je)', 'Avoir (tu)', 'Faire (il)', 'Aimer (nous)', 'Partir (vous)'] },
  };

  if (sel) {
    const c = contents[sel.id];
    return (
      <div className="fade-in">
        <button onClick={() => setSel(null)} style={{ ...S.btn, background: '#f3f4f6', color: COLORS.text, marginBottom: 16 }}>◀ Retour</button>
        <div style={S.card}>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{sel.t}</h2>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <span style={{ ...S.tag, background: '#eff6ff', color: '#2563eb' }}>{sel.l}</span>
            <span style={{ ...S.tag, background: '#f0fdf4', color: '#16a34a' }}>{sel.m}</span>
          </div>
          {c ? (
            <div>
              <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, marginBottom: 16, fontSize: 13, fontStyle: 'italic', lineHeight: 1.6 }}>{c.intro}</div>
              {c.qs.map((q, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{i + 1}. {q}</div>
                  <textarea style={{ ...S.input, minHeight: 50, resize: 'vertical', fontSize: 12 }} placeholder="Réponse..." />
                </div>
              ))}
            </div>
          ) : <p style={{ fontSize: 13, color: COLORS.textLight }}>{sel.d}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Exercices</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {exs.map(ex => (
          <div key={ex.id} onClick={() => setSel(ex)} style={{ ...S.card, cursor: 'pointer', transition: 'transform 0.15s' }}
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>{ex.id}</div>
              <div><div style={{ fontSize: 14, fontWeight: 700 }}>{ex.t}</div><div style={{ fontSize: 11, color: COLORS.textLight }}>{ex.l} • {ex.m}</div></div>
            </div>
            <p style={{ fontSize: 12, color: COLORS.textLight }}>{ex.d}</p>
            <div style={{ marginTop: 8 }}><span style={{ ...S.tag, background: '#eff6ff', color: '#2563eb' }}>{ex.q} questions</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="fade-in">
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Paramètres</h2>
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>👩‍🏫 Profil</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {[['Nom', 'Lamia Gnaba'], ['Matière', 'Français'], ['Établissement', 'Lycée'], ['Année', '2025-2026']].map(([l, v]) => (
            <div key={l}><label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textLight, display: 'block', marginBottom: 2 }}>{l}</label><input style={S.input} value={v} readOnly /></div>
          ))}
        </div>
      </div>
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🎯 Niveaux Enseignés</h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {LEVELS.map(l => <span key={l.id} style={{ ...S.tag, background: l.color + '15', color: l.color, padding: '6px 12px', fontSize: 12 }}>{l.icon} {l.name}</span>)}
        </div>
      </div>
      <div style={S.card}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>ℹ️ À Propos</h3>
        <p style={{ fontSize: 13, color: COLORS.textLight, lineHeight: 1.6 }}>
          LamiAI v1.0 • Assistant pédagogique pour Prof. Lamia Gnaba. Fonctionne sur PC et Android avec synchronisation automatique via le stockage local.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 12 }}>
          {[['📄', '100', 'Documents'], ['📚', '7', 'Niveaux'], ['📋', '25+', 'Modules'], ['✏️', '8', 'Exercices']].map(([i, v, l]) => (
            <div key={l} style={{ textAlign: 'center', padding: 12, background: '#f8fafc', borderRadius: 10 }}>
              <div>{i}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.primary }}>{v}</div>
              <div style={{ fontSize: 10, color: COLORS.textLight }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);

  useEffect(() => {
    const h = () => setSidebarOpen(window.innerWidth > 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  const pages = {
    home: { c: <HomePage setPage={setPage} />, t: 'Accueil', s: 'Tableau de bord' },
    docs: { c: <DocsPage />, t: 'Documents', s: '100 documents disponibles' },
    ai: { c: <AIPage />, t: 'Assistant IA', s: 'LamiAI - Votre assistant' },
    calendar: { c: <CalendarPage />, t: 'Emploi du Temps', s: 'Planning' },
    courses: { c: <CoursesPage />, t: 'Cours', s: 'Par niveau' },
    levels: { c: <LevelsPage />, t: 'Niveaux', s: 'Niveaux d\'enseignement' },
    exercises: { c: <ExercisesPage />, t: 'Exercices', s: '8 exercices' },
    settings: { c: <SettingsPage />, t: 'Paramètres', s: 'Configuration' },
  };

  const p = pages[page];

  return (
    <div style={S.app}>
      <Sidebar page={page} setPage={setPage} open={sidebarOpen} setOpen={setSidebarOpen} />
      <div style={S.main(sidebarOpen)}>
        <TopBar title={p.t} sub={p.s} onMenu={() => setSidebarOpen(!sidebarOpen)} />
        <div style={S.content}>{p.c}</div>
      </div>
    </div>
  );
}

export default App;
