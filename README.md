# 🎄 Liste de Noël Ilan

Un site de liste de Noël féerique : ciel étoilé, aurore boréale, neige qui réagit à la souris, village enneigé, sapin
interactif, guirlande lumineuse, traîneau du Père Noël… et des paquets-cadeaux qui se déballent en 3D.
Le curseur peut être un **cadeau**, un **traîneau** ou un **renne** (boutons en haut à droite).

Aucune installation, aucun outil de compilation : ce sont de simples fichiers HTML / CSS / JavaScript.

**Adresse du site** : https://ilanbs14.github.io/Liste/  (avec le mot magique : voir [le verrou](#-le-mot-magique-verrou-léger))

## Sommaire

1. [Voir le site](#voir-le-site)
2. [Ajouter ma liste](#ajouter-ma-liste) — dans un fichier **ou dans un Google Sheet**
3. [Photos de produits](#photos-de-produits)
4. [Mettre le site en ligne](#mettre-le-site-en-ligne-github-pages)
5. [Le mot magique (verrou léger)](#-le-mot-magique-verrou-léger)
6. [Aperçu au partage](#aperçu-au-partage-whatsapp-imessage)
7. [Le calendrier de l'Avent](#-le-calendrier-de-lavent-du-1er-au-25-décembre)
8. [Réglages utiles](#réglages-utiles) · [Fichiers](#organisation-des-fichiers) · [Secrets](#-spoilers--les-secrets-cachés)

---

## Voir le site

- **Dans VS Code / Codespaces** : ouvre un terminal dans ce dossier et lance

  ```bash
  python3 -m http.server 8000
  ```

  puis ouvre le port 8000 (onglet « Ports »).
- **Sur ton ordinateur** : double-clique sur `index.html`, ça fonctionne aussi.

> En local (`localhost` ou fichier ouvert directement), le verrou par mot magique est **désactivé** pour que tu puisses travailler.
> Pour le tester quand même, ajoute `?verrou` à l'adresse.

## Ajouter ma liste

Deux façons de faire, au choix.

### Option A — dans le fichier `data/ma-liste.js`

Tout est dans **[`data/ma-liste.js`](data/ma-liste.js)**, avec les explications en commentaires.

| Champ         | Rôle                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| `nom`         | Le nom du cadeau (obligatoire)                                                |
| `categorie`   | L'`id` d'une catégorie (obligatoire)                                          |
| `priorite`    | `1` petit plaisir · `2` j'en rêve · `3` le cadeau de mes rêves (« coup de cœur ») |
| `prix`        | Un nombre, sans symbole (`59.9`). Vide = « Surprise »                         |
| `lien`        | La page du produit (bouton « Voir le cadeau »)                                |
| `emoji`       | Un emoji (`"🎧"`) **ou l'adresse d'une photo** (voir plus bas)                |
| `description` | Une phrase pour donner envie                                                  |
| `note`        | Une précision pratique : taille, couleur, version…                            |
| `reserve`     | `true` si quelqu'un s'en occupe déjà (tampon « Réservé »)                     |

Quand la vraie liste est en place, passe `exemples` à `false` dans `config` pour retirer le bandeau « Exemples ».
Thèmes de papier cadeau pour les catégories : `rouge`, `vert`, `bleu`, `violet`, `or`, `rose`, `candy`.

### Option B — dans un Google Sheet (le site se met à jour tout seul)

Tu modifies un tableau comme dans Excel, sans toucher au code ni pousser quoi que ce soit : le site relit le tableau à chaque visite.

1. **Crée le tableau.** Dans [Google Sheets](https://sheets.new), fais *Fichier → Importer → Importer* et choisis
   [`data/modele-liste.csv`](data/modele-liste.csv) (« Remplacer la feuille de calcul »). Tu obtiens les bonnes colonnes :

   | nom | categorie | priorite | prix | lien | emoji ou photo | description | note | reserve |
   | --- | --- | --- | --- | --- | --- | --- | --- | --- |
   | Casque audio | 🎧 High-Tech | 3 | 129,90 | https://… | 🎧 | Pour… | Noir | |

2. **Publie-le.** *Fichier → Partager → Publier sur le Web* → onglet **Lien** → choisis ta feuille et le format
   **« Valeurs séparées par des virgules (.csv) »** → *Publier* → copie le lien.
3. **Branche-le au site.** Dans `data/ma-liste.js`, colle ce lien dans `feuille: "…"` (section `config`) et passe `exemples` à `false`.
   Pousse ce changement une fois sur GitHub. C'est la seule fois.
4. **Ensuite, tu ne modifies plus que le tableau.** Un changement apparaît sur le site en quelques minutes (Google garde le tableau publié
   en cache environ 5 minutes).

Comment remplir le tableau :

- **Colonnes** : seuls `nom` est obligatoire. L'ordre ne compte pas, les accents et majuscules non plus (`Catégorie`, `PRIX`…). `photo` ou `image` marchent à la place de `emoji ou photo`.
- **Catégorie** : écris son nom, avec un emoji devant si tu veux (`🎧 High-Tech`). Les catégories se créent toutes seules et reçoivent une couleur ; si le nom existe déjà dans `data/ma-liste.js`, ses couleurs sont reprises.
- **Priorité** : `1`, `2`, `3` ou des étoiles (`⭐⭐⭐`).
- **Prix** : `129,90`, `129.90`, `129,90 €`… tout est compris.
- **Réservé** : `oui` (ou `x`, `✓`, `1`) pour poser le tampon.
- Une ligne qui commence par `#` est ignorée (pratique pour mettre un commentaire).
- Si le tableau est injoignable, le site affiche la dernière version qu'il a mémorisée sur l'appareil du visiteur.

> ⚠️ Un tableau « publié sur le Web » est lisible par **toute personne qui a son lien**. Le lien se trouve dans `data/ma-liste.js` : si ton dépôt GitHub est public, il est lisible par tout le monde. Ne mets rien de sensible dans ce tableau (adresse, téléphone…).

## Photos de produits

Dans la colonne/le champ **emoji**, mets l'adresse d'une image au lieu d'un emoji : elle devient la photo du cadeau au dos du paquet
(png, jpg, jpeg, webp, gif, avif…).

- Fais un clic droit sur l'image du produit → *Copier l'adresse de l'image* (elle doit pointer **directement vers l'image**, pas vers la page).
- Les liens de partage Google Drive / Dropbox / Pinterest ne sont pas des liens directs vers l'image.
- Tu peux aussi déposer tes photos dans le dossier `assets/` et écrire `assets/casque.jpg`.
- Si une photo ne se charge pas (lien cassé, site qui bloque l'affichage), le site affiche l'emoji de la catégorie à la place.

## Mettre le site en ligne (GitHub Pages)

GitHub Pages est **déjà activé** sur ce dépôt (branche `main`, dossier racine) : ton site est donc en ligne à l'adresse
**https://ilanbs14.github.io/Liste/**. Chaque `git push` sur `main` met le site à jour en une ou deux minutes.

GitHub Pages est gratuit pour un dépôt **public**. Pour un dépôt privé, il faut un abonnement payant.

## 🔒 Le mot magique (verrou léger)

Le site ne s'ouvre que si l'adresse se termine par le mot magique :

```
https://ilanbs14.github.io/Liste/?guimauve-givree
```

- Sans le mot (ou avec un mauvais mot), on voit un écran « Chut… c'est privé ! » avec un cadenas, et un champ pour saisir le mot.
- Le mot ignore les majuscules, les accents et les tirets : `?Guimauve_Givrée` ouvre aussi la porte.
- Après un premier accès réussi, le lien **sans** le mot fonctionne sur cet appareil (réglage `memoriser` dans `data/ma-liste.js`).
- Le mot n'est **pas écrit en clair** dans le dépôt : seul son empreinte (SHA-256) l'est.
- Les moteurs de recherche reçoivent une consigne `noindex`, et l'aperçu de partage continue de fonctionner.

**Changer le mot** : ouvre [`outils/mot-de-passe.html`](outils/mot-de-passe.html) dans ton navigateur, tape le nouveau mot, copie la ligne `hash` dans
`data/ma-liste.js` (section `acces`), puis envoie le nouveau lien. L'ancien mot cesse de marcher, même sur les appareils qui l'avaient mémorisé.
Pour couper le verrou : `actif: false`.

> ⚠️ **C'est une sécurité légère.** Un site hébergé sur GitHub Pages est un ensemble de fichiers publics : le verrou écarte les curieux
> et les moteurs de recherche, pas quelqu'un qui fouillerait le code du dépôt ou la page. Si ta liste doit être vraiment secrète, ne la mets pas en ligne.

## Aperçu au partage (WhatsApp, iMessage…)

Quand tu envoies le lien, les messageries affichent une carte avec l'image [`assets/apercu.jpg`](assets/apercu.jpg) (1200×630),
le titre et la description. Tout est déclaré dans le `<head>` de `index.html` (balises `og:` et `twitter:`).

- Pour changer l'image : remplace `assets/apercu.jpg` par n'importe quelle image 1200×630 (moins de 300 Ko, c'est idéal pour WhatsApp).
- Si l'adresse du site change (autre nom de dépôt, nom de domaine…), remplace `https://ilanbs14.github.io/Liste/` dans ce bloc.
- Les messageries gardent l'aperçu en mémoire : après un changement, il peut falloir attendre ou utiliser leurs outils de rafraîchissement
  (par exemple le « Sharing Debugger » de Facebook).
- Le titre et la description de l'aperçu ne suivent pas `data/ma-liste.js` (les messageries n'exécutent pas le JavaScript) : modifie-les dans `index.html`.

## 🎁 Le calendrier de l'Avent (du 1er au 25 décembre)

> **État actuel : désactivé.** Rien n'a été supprimé : pour le remettre, mets `avent: true` dans la section `config` de
> `data/ma-liste.js`. Désactivé, le bouton, la fenêtre du calendrier et les animations du jour disparaissent complètement.

Chaque jour de décembre, le site offre une **animation spéciale différente**. Elle se joue toute seule à la première visite de la journée,
le titre d'accueil annonce « Jour N de l'Avent », et le bouton en bas à gauche ouvre le **calendrier** : les portes déjà ouvertes rejouent leur
surprise, les autres restent fermées (« Cette porte s'ouvre le 12 décembre »). En mode calme, seul le message du jour s'affiche.

Pour **essayer un jour** sans attendre : ajoute `jour=12` à l'adresse (ex. `…/?guimauve-givree&jour=12`). `jour=25` ouvre toutes les portes.

| Jour | Surprise | Jour | Surprise |
| ---: | --- | ---: | --- |
| 1 | Le premier flocon (gros flocons détaillés) | 14 | Sous le gui (cœurs et houx) |
| 2 | Pluie d'étoiles filantes | 15 | Bonnets et moufles |
| 3 | Cannes en sucre | 16 | Le Père Noël en repérage (2 passages) |
| 4 | La parade des lutins | 17 | Tempête de neige |
| 5 | Concert de clochettes (avec le son) | 18 | Biscuits pour le Père Noël |
| 6 | Saint-Nicolas (pain d'épices, mandarines) | 19 | Feux d'artifice |
| 7 | Aurore boréale éclatante | 20 | Les boules s'échappent du sapin |
| 8 | Le bonhomme de neige danse | 21 | Solstice d'hiver (la plus longue nuit) |
| 9 | Le petit train de Noël | 22 | Les rennes à toute vitesse |
| 10 | Pluie de cadeaux | 23 | Pluie d'or |
| 11 | Guirlande en folie | 24 | Le décollage du traîneau (3 passages) |
| 12 | Lanternes dans la nuit | 25 | Joyeux Noël ! (grand final) |
| 13 | Bataille de boules de neige | | |

Les textes et les animations sont dans [`js/avent.js`](js/avent.js) (tableau `JOURS`).

## Réglages utiles

- **Textes du héros** : `titre`, `sousTitre` et `prenom` dans `data/ma-liste.js`.
- **Mode calme** (bouton flocon) : coupe presque toutes les animations. Il s'active automatiquement pour les personnes
  qui ont demandé « réduire les animations » dans leur système.
- **Son** (bouton cloche) : désactivé par défaut. Les clochettes sont synthétisées, il n'y a aucun fichier audio.

## Organisation des fichiers

```
index.html              la page (+ aperçu de partage dans le <head>)
data/ma-liste.js        ✏️  ta liste, le lien du Google Sheet et le mot magique
data/modele-liste.csv   modèle de tableau à importer dans Google Sheets
outils/mot-de-passe.html  calcule l'empreinte d'un nouveau mot magique
css/base.css            couleurs, polices, réglages de base
css/scene.css           ciel, neige, village, sapin, guirlande, traîneau
css/ui.css              barre du haut, cartes-cadeaux, boutons, curseur, écran d'accès
css/avent.css           calendrier de l'Avent et animations du jour
js/gate.js              verrou par mot magique
js/art.js               toutes les illustrations (SVG)
js/fx.js                confettis, étincelles, neige
js/cursor.js            curseur cadeau / traîneau / renne
js/scene.js             décor vivant et lutins cachés
js/feuille.js           lecture du Google Sheet
js/liste.js             fabrication des cadeaux, filtres, tri, recherche, photos
js/secrets.js           easter eggs et carnet des secrets
js/avent.js             les 25 animations et le calendrier
assets/                 polices, favicon, image d'aperçu
```

## 🤫 Spoilers : les secrets cachés

Le site contient 13 secrets, listés (avec des indices) dans le **Carnet des secrets** (bouton ★ en haut à droite).
Si tu veux garder la surprise, arrête de lire ici.

<details>
<summary>Voir la solution des secrets</summary>

- **Code du Père Noël** : ↑ ↑ ↓ ↓ ← → ← → B A
- **La Lune** : clique dessus, quelqu'un passe devant.
- **Le bonhomme de neige** : clique 3 fois, il perd sa carotte.
- **L'étoile du sapin** : clique dessus pour faire un vœu.
- **Concert de sapin** : joue « Mi Mi Mi, Mi Mi Mi, Mi Sol Do Ré Mi » avec les boules du sapin.
- **La guirlande** : clique sur les ampoules pour changer de mode, jusqu'au mode disco.
- **Livraison express** : clique sur le traîneau quand il passe dans le ciel.
- **Le grand déballage** : bouton « Tout déballer ».
- **La chasse aux lutins** : 5 lutins sont cachés (sur un toit du village, au pied du sapin, au bord de la liste, derrière le 3e paquet, en bas de page). Le compteur « Lutins » est dans le pied de page.
- **Mots à taper au clavier** : `grinch`, `rudolph` (ou `renne`), `neige` (ou `blizzard`) et `noel`.
- **Chut, ça dort** : ne bouge plus la souris pendant 25 secondes.
- **Tout trouver** débloque le mode doré. 🌟

</details>
