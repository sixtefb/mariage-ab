# Guide de déploiement — App Mariage

## Étape 1 — Firebase (backend, ~10 min)

1. Va sur https://console.firebase.google.com
2. Clique **Créer un projet** → nom : `mariage-thomas` → Continuer
3. Désactive Google Analytics → **Créer le projet**

### Firestore (base de données)
4. Menu gauche → **Firestore Database** → **Créer une base de données**
5. Mode **Production** → choisis **europe-west3 (Frankfurt)** → Terminer
6. Onglet **Règles** → remplace tout par :
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{doc} {
      allow read: if true;
      allow create: if request.resource.data.name is string
        && request.resource.data.message is string
        && request.resource.data.name.size() < 100
        && request.resource.data.message.size() < 1000;
      allow delete: if false;
    }
  }
}
```
7. **Publier**

### Storage (photos)
8. Menu gauche → **Storage** → **Commencer**
9. Mode Production → même région que Firestore → Terminer
10. Onglet **Règles** → remplace par :
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /photos/{allPaths=**} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```
11. **Publier**

### Récupérer les clés
12. ⚙️ (roue dentée) → **Paramètres du projet** → onglet **Général**
13. Bas de page → **Ajouter une application** → icône Web `</>`
14. Nom : `mariage-web` → **Enregistrer**
15. Copie le bloc `firebaseConfig` affiché

---

## Étape 2 — Variables d'environnement

1. Dans le dossier du projet, duplique `.env.local.example` → `.env.local`
2. Remplis avec tes valeurs Firebase :
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mariage-thomas.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mariage-thomas
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mariage-thomas.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...
NEXT_PUBLIC_APP_URL=https://mariage-thomas.vercel.app
NEXT_PUBLIC_ADMIN_PASSWORD=motdepassesecret
```

---

## Étape 3 — Déploiement Vercel (~5 min)

1. Va sur https://vercel.com → créer un compte (gratuit)
2. **Add New Project** → importe depuis GitHub
   - Si pas de GitHub : installe Vercel CLI → `npx vercel` dans le dossier
3. Dans Vercel, ajoute les variables d'environnement (Settings → Environment Variables)
4. Déploie → tu obtiens une URL genre `mariage-thomas.vercel.app`
5. Mets cette URL dans `NEXT_PUBLIC_APP_URL`

---

## Étape 4 — QR Code

1. Va sur `/admin` (ex: `mariage-thomas.vercel.app/admin`)
2. Entre ton mot de passe admin
3. Le QR code est généré → **Télécharger**
4. Imprime et pose sur les tables 🎉

---

## Personnalisation rapide

Dans `app/page.tsx`, ligne ~25 :
```tsx
<h1 style={styles.title}>Thomas & Marie</h1>   // ← Change les prénoms
<p style={styles.date}>21 Juin 2026</p>          // ← Change la date
```

---

## Pour tester en local

```bash
npm install
npm run dev
```
Ouvre http://localhost:3000
