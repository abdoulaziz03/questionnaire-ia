# Questionnaire IA & Assurance — France × Côte d'Ivoire

Questionnaire web anonyme pour un mémoire de Master en Project Management :
*« L'intelligence artificielle comme outil structurant de la relation client
dans le secteur de l'assurance »*. Enquête comparative France – Côte d'Ivoire.

Construit avec **Next.js (App Router) · TypeScript · Tailwind CSS v4**, prêt à
déployer sur **Vercel**.

## Fonctionnement

- Le répondant choisit d'abord son pays (France ou Côte d'Ivoire).
- Le questionnaire s'adapte : les questions communes et celles spécifiques au
  pays s'affichent automatiquement (logique pilotée par `lib/questions.ts`).
- L'interface se teinte selon le pays choisi (bleu pour la France, ambre pour la
  Côte d'Ivoire).
- Navigation par parties (1 à 5), barre de progression, validation des questions
  obligatoires, écran de remerciement.
- Les réponses sont envoyées à `/api/submit`, qui les transfère vers une feuille
  Google Sheets (voir plus bas).

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000

Sans configuration de stockage, les réponses envoyées sont simplement affichées
dans la console du serveur — pratique pour tester.

## Collecte des réponses (Google Sheets, gratuit)

1. Créez une feuille sur https://sheets.google.com
2. Menu **Extensions → Apps Script**, collez le contenu de
   [`google-apps-script.gs`](./google-apps-script.gs).
3. **Déployer → Nouveau déploiement** : type *Application Web*, exécuter en tant
   que *Moi*, accès *Tout le monde*. Copiez l'URL `…/exec`.
4. Renseignez cette URL dans la variable d'environnement `SHEETS_WEBHOOK_URL`
   (en local : fichier `.env.local` ; sur Vercel : *Settings → Environment
   Variables*).

Chaque réponse ajoute une ligne ; les colonnes correspondent aux questions et se
complètent selon le pays. Idéal pour l'analyse (filtres, tableaux croisés).

> Alternative : tout endpoint acceptant un POST JSON convient (Formspree,
> Make, n8n, votre propre API…). Il suffit de pointer `SHEETS_WEBHOOK_URL`
> dessus.

## Déployer sur Vercel

Le dossier est déjà un dépôt Git (`questionnaire-ia`). Deux options :

**A. Via le tableau de bord Vercel (recommandé)**

1. Poussez le code sur GitHub :
   ```bash
   git add .
   git commit -m "Questionnaire IA assurance"
   git push
   ```
2. Sur https://vercel.com → **Add New… → Project**, importez le dépôt.
3. Ajoutez la variable `SHEETS_WEBHOOK_URL` (Environment Variables).
4. **Deploy**. Vercel détecte Next.js automatiquement.

**B. Via la CLI**

```bash
npm i -g vercel
vercel            # premier déploiement (preview)
vercel --prod     # déploiement en production
```

Pensez à ajouter la variable d'environnement avec
`vercel env add SHEETS_WEBHOOK_URL` puis à redéployer.

## Structure

```
app/
  layout.tsx          Layout racine, métadonnées, polices
  page.tsx            Point d'entrée
  globals.css         Styles + design tokens (palette, teinte par pays)
  api/submit/route.ts Réception des réponses → Google Sheets
components/
  Survey.tsx          Orchestrateur (pays, navigation, validation, envoi)
  QuestionField.tsx   Rendu d'une question selon son type
  icons.tsx           Icônes SVG
lib/
  questions.ts        Toutes les questions + logique de branchement par pays
google-apps-script.gs Script de collecte Google Sheets
```

## Modifier le questionnaire

Tout se trouve dans `lib/questions.ts`. Chaque question possède :

- `scope` : `"common"` (les deux pays), `"FR"` ou `"CIV"` ;
- `type` : `"single"`, `"multi"`, `"scale"` (1–5) ou `"text"` ;
- `options` éventuelles, avec un `country` par option pour les cas mixtes (Q10) ;
- `maxSelect` pour limiter le nombre de choix (ex. « 2 choix maximum »).

Ajouter, retirer ou réordonner une question se fait uniquement ici, sans toucher
à l'interface.
