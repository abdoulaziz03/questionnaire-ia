// Modèle de données du questionnaire.
// Tout l'affichage et le branchement par pays sont pilotés à partir d'ici.

export type Country = "FR" | "CIV";

// "common" = posée aux deux pays | "FR" = France | "CIV" = Côte d'Ivoire
export type Scope = "common" | "FR" | "CIV";

export type QuestionType = "single" | "multi" | "scale" | "text";

export interface Option {
  value: string;
  label: string;
  // Si défini, l'option n'apparaît que pour ce pays (utilisé en Q10).
  country?: Country;
  // Si vrai, sélectionner cette option ouvre un champ texte (ex. « Autre »).
  withText?: boolean;
}

export interface Question {
  id: string; // identifiant interne unique
  display: string; // numéro affiché à l'utilisateur (ex. « Q4 »)
  part: number; // numéro de partie (1 à 5)
  scope: Scope;
  type: QuestionType;
  label: string;
  help?: string; // consigne (ex. « Plusieurs réponses possibles »)
  required?: boolean;
  options?: Option[];
  maxSelect?: number; // pour les questions à choix multiple limité
  scaleLabels?: [string, string]; // [extrémité gauche, extrémité droite] pour les échelles
  placeholder?: string; // pour les champs texte
}

export interface Part {
  number: number;
  title: string;
}

export const PARTS: Part[] = [
  { number: 1, title: "Profil du répondant" },
  { number: 2, title: "Pratiques assurantielles actuelles" },
  { number: 3, title: "Perception de l'intelligence artificielle" },
  { number: 4, title: "Impact du changement et regard comparatif" },
  { number: 5, title: "Vision et perspectives" },
];

export const QUESTIONS: Question[] = [
  // ---------- PARTIE 1 — Profil ----------
  {
    id: "q1",
    display: "Q1",
    part: 1,
    scope: "common",
    type: "single",
    required: true,
    label: "Quel est votre lien avec le secteur de l'assurance ?",
    options: [
      { value: "client", label: "Client(e) d'une compagnie d'assurance" },
      { value: "agent", label: "Agent, courtier ou conseiller en assurance" },
      { value: "employe", label: "Employé(e) dans une compagnie d'assurance" },
      {
        value: "etudiant",
        label: "Étudiant(e) / chercheur(se) en gestion, management ou finance",
      },
      { value: "autre", label: "Autre", withText: true },
    ],
  },
  {
    id: "q2",
    display: "Q2",
    part: 1,
    scope: "common",
    type: "single",
    required: true,
    label:
      "Depuis combien d'années êtes-vous en relation avec votre assureur principal ?",
    options: [
      { value: "moins_1", label: "Moins d'1 an" },
      { value: "1_5", label: "1 à 5 ans" },
      { value: "5_10", label: "5 à 10 ans" },
      { value: "plus_10", label: "Plus de 10 ans" },
    ],
  },

  // ---------- PARTIE 2 — Pratiques ----------
  {
    id: "q3",
    display: "Q3",
    part: 2,
    scope: "common",
    type: "single",
    required: true,
    label:
      "Comment gérez-vous habituellement votre contrat d'assurance (souscription, sinistre, renouvellement) ?",
    options: [
      { value: "agence", label: "Toujours en agence, en personne avec un conseiller" },
      { value: "telephone", label: "Principalement par téléphone avec un agent" },
      { value: "mixte", label: "Mixte : en ligne et en agence selon les besoins" },
      { value: "en_ligne", label: "Uniquement via une application ou un site web" },
    ],
  },
  {
    id: "q4_fr",
    display: "Q4",
    part: 2,
    scope: "FR",
    type: "single",
    required: true,
    label:
      "Utilisez-vous les outils digitaux proposés par votre assureur (espace client, appli mobile, devis en ligne) ?",
    options: [
      { value: "tout_en_ligne", label: "Oui, je gère tout en ligne — je vais rarement en agence" },
      { value: "actes_simples", label: "Oui, pour les actes simples ; en agence pour les cas complexes" },
      { value: "rarement", label: "Rarement — je préfère toujours le contact humain" },
      { value: "non_connais_pas", label: "Non, je ne savais pas que ces outils existaient" },
    ],
  },
  {
    id: "q4_civ",
    display: "Q4",
    part: 2,
    scope: "CIV",
    type: "multi",
    required: true,
    label: "Dans le système actuel, quelles difficultés avez-vous rencontrées avec votre assureur ?",
    help: "Plusieurs réponses possibles",
    options: [
      { value: "delais", label: "Délais longs pour le traitement des sinistres" },
      { value: "deplacements", label: "Déplacements obligatoires en agence pour des formalités simples" },
      { value: "joindre", label: "Difficulté à joindre un conseiller rapidement" },
      { value: "garanties", label: "Manque de clarté sur les garanties proposées" },
      { value: "personnalisation", label: "Manque de personnalisation des offres" },
      { value: "aucune", label: "Aucune difficulté particulière" },
    ],
  },
  {
    id: "q5",
    display: "Q5",
    part: 2,
    scope: "common",
    type: "multi",
    required: true,
    label:
      "Quels aspects du fonctionnement traditionnel méritent d'être conservés, même avec l'arrivée de l'IA ?",
    help: "Plusieurs réponses possibles",
    options: [
      { value: "relation", label: "La relation personnalisée avec un conseiller humain" },
      { value: "signature", label: "La signature physique ou manuscrite du contrat" },
      { value: "evaluation", label: "L'évaluation humaine des sinistres complexes" },
      { value: "constat", label: "Le constat amiable établi avec un agent sur place" },
      { value: "aucun", label: "Aucun — tout peut être automatisé" },
    ],
  },

  // ---------- PARTIE 3 — Perception IA ----------
  {
    id: "q6",
    display: "Q6",
    part: 3,
    scope: "common",
    type: "single",
    required: true,
    label:
      "Avez-vous déjà interagi avec un service automatisé (chatbot, assistant virtuel, appli) chez votre assureur ?",
    options: [
      { value: "regulierement", label: "Oui, régulièrement" },
      { value: "occasionnellement", label: "Oui, occasionnellement" },
      { value: "non_favorable", label: "Non, mais j'y serais favorable" },
      { value: "non_humain", label: "Non, et je préfère un contact humain" },
    ],
  },
  {
    id: "q7_fr",
    display: "Q7",
    part: 3,
    scope: "FR",
    type: "single",
    required: true,
    label:
      "Votre assureur vous propose-t-il déjà des services basés sur l'IA (tarification personnalisée, sinistre en ligne, chatbot) ?",
    options: [
      { value: "oui_utilise", label: "Oui, et je les utilise régulièrement" },
      { value: "oui_pas_utilise", label: "Oui, mais je ne les utilise pas vraiment" },
      { value: "ne_sais_pas", label: "Je ne sais pas si ces services existent chez mon assureur" },
      { value: "non_traditionnel", label: "Non, mon assureur reste très traditionnel" },
    ],
  },
  {
    id: "q7_civ",
    display: "Q7",
    part: 3,
    scope: "CIV",
    type: "multi",
    required: true,
    maxSelect: 2,
    label: "Dans quels domaines l'IA apporterait-elle le plus de valeur dans l'assurance ivoirienne ?",
    help: "2 choix maximum",
    options: [
      { value: "assistance", label: "Assistance 24h/24 sans déplacement en agence" },
      { value: "sinistres", label: "Traitement rapide des sinistres (auto, habitation, maladie)" },
      { value: "primes", label: "Calcul automatisé des primes et cotations" },
      { value: "fraude", label: "Détection de la fraude à l'assurance" },
      { value: "offres", label: "Personnalisation automatique des offres selon le profil" },
    ],
  },
  {
    id: "q8",
    display: "Q8",
    part: 3,
    scope: "common",
    type: "scale",
    required: true,
    label:
      "Dans quelle mesure faites-vous confiance à une décision prise par une IA concernant votre contrat d'assurance ?",
    scaleLabels: ["Pas du tout confiance", "Totalement confiance"],
  },

  // ---------- PARTIE 4 — Impact & comparatif ----------
  {
    id: "q9_fr",
    display: "Q9",
    part: 4,
    scope: "FR",
    type: "single",
    required: true,
    label:
      "En France, l'IA est déjà une réalité dans l'assurance. Estimez-vous que cette transformation a amélioré votre expérience client ?",
    options: [
      { value: "oui_nettement", label: "Oui, nettement — plus rapide et plus pratique" },
      { value: "partiellement", label: "Partiellement — pratique pour le simple, insuffisant pour le complexe" },
      { value: "non_qualite", label: "Non — j'ai l'impression de perdre en qualité de conseil" },
      { value: "pas_de_changement", label: "Je ne perçois pas encore de changement significatif" },
    ],
  },
  {
    id: "q9_civ",
    display: "Q9",
    part: 4,
    scope: "CIV",
    type: "single",
    required: true,
    label:
      "Pensez-vous que le marché ivoirien de l'assurance est prêt à intégrer l'IA dans ses processus actuels ?",
    options: [
      { value: "oui_pret", label: "Oui, la demande existe et le marché est prêt" },
      { value: "partiellement", label: "Partiellement — pour les jeunes urbains connectés, pas encore pour tous" },
      { value: "non_infra", label: "Non — les infrastructures numériques sont encore insuffisantes" },
      { value: "non_culture", label: "Non — la culture de l'assurance est encore trop peu répandue" },
    ],
  },
  {
    id: "q10",
    display: "Q10",
    part: 4,
    scope: "common",
    type: "multi",
    required: true,
    maxSelect: 2,
    label: "Quels freins vous semblent les plus importants à l'adoption de l'IA dans votre pays ?",
    help: "2 choix maximum",
    options: [
      { value: "transparence", label: "Manque de transparence des algorithmes de décision" },
      { value: "donnees", label: "Risques liés à la protection des données personnelles" },
      { value: "lien_humain", label: "Perte du lien humain dans la relation client" },
      { value: "resistance", label: "Résistance des conseillers et agents en place", country: "FR" },
      { value: "acces_num", label: "Faible taux d'accès au numérique et à internet", country: "CIV" },
      { value: "confiance_culturelle", label: "Manque de confiance culturelle envers les automatismes", country: "CIV" },
      { value: "cout", label: "Coût élevé de déploiement des technologies IA" },
    ],
  },
  {
    id: "q11",
    display: "Q11",
    part: 4,
    scope: "common",
    type: "single",
    required: true,
    label: "Pensez-vous que l'IA peut remplacer totalement le conseiller humain dans la relation assurantielle ?",
    options: [
      { value: "oui_courantes", label: "Oui, pour la majorité des interactions courantes" },
      { value: "oui_simples", label: "Oui pour les tâches simples, non pour les cas complexes ou sensibles" },
      { value: "non_humaine", label: "Non — la relation humaine reste indispensable" },
      { value: "non_ethique", label: "Non — cela poserait des problèmes éthiques et de responsabilité" },
    ],
  },
  {
    id: "q12",
    display: "Q12",
    part: 4,
    scope: "common",
    type: "scale",
    required: true,
    label:
      "Quel est votre niveau de préoccupation concernant l'utilisation de vos données personnelles par une IA dans l'assurance ?",
    scaleLabels: ["Pas préoccupé(e)", "Très préoccupé(e)"],
  },

  // ---------- PARTIE 5 — Vision ----------
  {
    id: "q13_fr",
    display: "Q13",
    part: 5,
    scope: "FR",
    type: "single",
    required: true,
    label: "Selon vous, quel modèle d'assurance sera dominant en France dans 10 ans ?",
    options: [
      { value: "digitalise", label: "Entièrement digitalisé — IA et selfcare sans agence physique" },
      { value: "hybride", label: "Hybride — IA pour le quotidien, humain pour le conseil stratégique" },
      { value: "modernise", label: "Légèrement modernisé — le modèle actuel restera dominant" },
      { value: "ne_sais_pas", label: "Je ne sais pas" },
    ],
  },
  {
    id: "q13_civ",
    display: "Q13",
    part: 5,
    scope: "CIV",
    type: "single",
    required: true,
    label: "Selon vous, quel modèle d'assurance sera dominant en Côte d'Ivoire dans 10 ans ?",
    options: [
      { value: "digitalise", label: "Fortement digitalisé grâce à l'essor du mobile money et des fintechs" },
      { value: "hybride", label: "Hybride — agences physiques + outils numériques complémentaires" },
      { value: "traditionnel", label: "Encore majoritairement traditionnel — la transition prendra du temps" },
      { value: "ne_sais_pas", label: "Je ne sais pas" },
    ],
  },
  {
    id: "q14",
    display: "Q14",
    part: 5,
    scope: "common",
    type: "text",
    required: false,
    label:
      "En quelques mots, quelle évolution souhaiteriez-vous voir dans la relation client de votre assureur grâce à l'IA, tout en préservant ce qui fonctionne aujourd'hui ?",
    placeholder: "Votre réponse (facultatif)…",
  },
];

// Renvoie les questions visibles pour un pays donné, dans l'ordre.
export function questionsForCountry(country: Country): Question[] {
  return QUESTIONS.filter((q) => q.scope === "common" || q.scope === country);
}

// Renvoie les options visibles d'une question pour un pays (filtre Q10).
export function optionsForCountry(q: Question, country: Country): Option[] {
  if (!q.options) return [];
  return q.options.filter((o) => !o.country || o.country === country);
}
