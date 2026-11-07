# Inscription – Master Class Programmation Web

Page d'inscription de Kaléidoscope Group : site statique (HTML, CSS, JS) hébergé sur GitHub Pages, base de données **Supabase** et mail de confirmation avec **EmailJS**. 

## Structure

```
index.html            Structure de la page
css/style.css         Design (couleurs et styles de l'affiche)
js/config.js          Vos clés et les infos de la Master Class  ← à modifier
js/app.js             Logique de la page (formulaire, questionnaire, envoi)
js/validation.js      Règles de validation (nom, mail, téléphone…)
js/api.js             Échanges avec Supabase et EmailJS
js/countdown.js       Compte à rebours
supabase/schema.sql   Création de la table (à exécuter une fois dans Supabase)
```

## 1. Base de données (Supabase)

1. Créez un compte sur supabase.com, puis un projet (New project).
2. Menu **SQL Editor** → New query → collez tout le contenu de `supabase/schema.sql` → **Run**.
3. Menu **Project Settings → API** : copiez l'**URL du projet** et la clé publique (**anon** ou **publishable**).
4. Collez-les dans `js/config.js` (section `supabase`).

À ne jamais mettre dans le site : la clé `service_role` (clé secrète).

Les inscrits se consultent dans **Table Editor → inscriptions** (export CSV possible). Le public peut seulement ajouter une ligne, pas lire les autres.

## 2. Mail de confirmation (EmailJS)

1. Compte sur emailjs.com.
2. **Email Services → Add New Service** : connectez votre adresse (Gmail par exemple). Notez le **Service ID**.
3. **Email Templates → Create New Template** :
   - **To Email** : `{{email}}`
   - **Subject** : `Inscription confirmée – Master Class Programmation Web`
   - **Contenu** :

```
Bonjour {{prenom}} {{nom}},

Votre inscription à la Master Class Programmation Web (HTML - CSS - JS - PHP) est bien enregistrée.

Lieu : {{lieu}}
Dates : {{dates}}
Montant : {{montant}}
Frais d'inscription : {{frais_inscription}}

Pour toute question : {{contact}}

À très bientôt,
Kaléidoscope Group
```

   Notez le **Template ID**.
4. **Account → General** : copiez votre **Public Key**.
5. Collez les trois valeurs dans `js/config.js` (section `emailjs`).

Limites à connaître :
- L'offre gratuite d'EmailJS permet **200 mails par mois**. Au-delà, les inscriptions restent enregistrées dans Supabase mais le mail ne part plus.
- La restriction par nom de domaine est réservée aux offres payantes : vos identifiants EmailJS restent donc visibles dans le code du site.
- Si le mail échoue, l'inscription est quand même enregistrée et la personne en est informée.

## 3. Tester en local

Les modules JavaScript ne marchent pas en double-cliquant sur `index.html`. Utilisez l'extension **Live Server** de VS Code (clic droit sur `index.html` → Open with Live Server).

## 4. Mise en ligne sur GitHub Pages

1. Créez un dépôt GitHub public et envoyez-y tous les fichiers (`index.html` à la racine).
2. **Settings → Pages** → Source : *Deploy from a branch* → branche `main`, dossier `/ (root)` → Save.
3. Après une minute, le site est disponible sur `https://VOTRE-COMPTE.github.io/NOM-DU-DEPOT/`.

## 5. Code QR pour l'affiche

Générez le QR avec cette adresse (qr-code-generator, QRCode Monkey, etc.). Téléchargez-le en **PNG haute résolution** ou en SVG pour qu'il reste net à l'impression, puis testez-le avec plusieurs téléphones avant d'imprimer.

## À savoir

- Sur l'offre gratuite de Supabase, un projet sans activité pendant environ une semaine peut être mis en pause (il se réactive depuis le tableau de bord). Faites une inscription test avant l'impression de l'affiche pour vérifier que tout répond.
- Pour modifier les dates, le lieu ou les contacts dans le mail : `js/config.js`. Pour la page elle-même : `index.html`.

Lien : https://PlamediMujinga.github.io/Inscription-MasterClass-Web/
