# 🎄 Liste de Noël Ilan

Un site de liste de Noël féerique : ciel étoilé, aurore boréale, neige qui réagit à la souris, village enneigé, sapin
interactif, guirlande lumineuse, traîneau du Père Noël… et des paquets-cadeaux qui se déballent en 3D.
Le curseur peut être un **cadeau**, un **traîneau** ou un **renne** (boutons en haut à droite).

Aucune installation, aucun outil de compilation : ce sont de simples fichiers HTML / CSS / JavaScript.

## Voir le site

- **Dans VS Code / Codespaces** : ouvre un terminal dans ce dossier et lance

  ```bash
  python3 -m http.server 8000
  ```

  puis ouvre le port 8000 (onglet « Ports »).
- **Sur ton ordinateur** : double-clique sur `index.html`, ça fonctionne aussi.

## Ajouter ma liste

Tout se passe dans **un seul fichier : [`data/ma-liste.js`](data/ma-liste.js)**. Les explications y sont écrites en
commentaires. En résumé :

| Champ         | Rôle                                                                          |
| ------------- | ----------------------------------------------------------------------------- |
| `nom`         | Le nom du cadeau (obligatoire)                                                |
| `categorie`   | L'`id` d'une catégorie (obligatoire)                                          |
| `priorite`    | `1` petit plaisir · `2` j'en rêve · `3` le cadeau de mes rêves (« coup de cœur ») |
| `prix`        | Un nombre, sans symbole (`59.9`). Vide = « Surprise »                         |
| `lien`        | La page du produit (bouton « Voir le cadeau »)                                |
| `emoji`       | L'illustration du cadeau (ex. `"🎧"`)                                         |
| `image`       | (facultatif) L'adresse d'une photo : elle remplace l'emoji                    |
| `description` | Une phrase pour donner envie                                                  |
| `note`        | Une précision pratique : taille, couleur, version…                            |
| `reserve`     | `true` si quelqu'un s'en occupe déjà (tampon « Réservé »)                     |

Quand la vraie liste est en place, passe `exemples` à `false` dans `config` pour retirer le bandeau « Exemples ».

Thèmes de papier cadeau pour les catégories : `rouge`, `vert`, `bleu`, `violet`, `or`, `rose`, `candy`.

## Mettre le site en ligne (GitHub Pages)

1. Pousse le dépôt sur GitHub.
2. Dans **Settings → Pages**, choisis « Deploy from a branch », la branche `main` et le dossier `/ (root)`.
3. Après une minute, le site est disponible à l'adresse affichée par GitHub.

## Réglages utiles

- **Textes du héros** : `titre` et `sousTitre` dans `data/ma-liste.js` (le `<title>` de la page suit le titre).
- **Aperçu au partage** (WhatsApp, iMessage…) : les balises `og:` sont dans `index.html`.
- **Mode calme** (bouton flocon) : coupe presque toutes les animations. Il s'active automatiquement pour les personnes
  qui ont demandé « réduire les animations » dans leur système.
- **Son** (bouton cloche) : désactivé par défaut. Les clochettes sont synthétisées, il n'y a aucun fichier audio.

## Organisation des fichiers

```
index.html            la page
data/ma-liste.js      ✏️  ta liste (le seul fichier à modifier)
css/base.css          couleurs, polices, réglages de base
css/scene.css         ciel, neige, village, sapin, guirlande, traîneau
css/ui.css            barre du haut, cartes-cadeaux, boutons, curseur…
js/art.js             toutes les illustrations (SVG)
js/fx.js              confettis, étincelles, neige
js/cursor.js          curseur cadeau / traîneau / renne
js/scene.js           décor vivant et lutins cachés
js/liste.js           fabrication des cadeaux, filtres, tri, recherche
js/secrets.js         easter eggs et carnet des secrets
assets/fonts          polices auto-hébergées (Mountains of Christmas, Nunito, Caveat)
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
- **La chasse aux lutins** : 5 lutins sont cachés (toit du village, sapin, bord de la liste, dos d'un paquet, bas de page).
- **Mots à taper au clavier** : `grinch`, `rudolph` (ou `renne`), `neige` (ou `blizzard`) et `noel`.
- **Chut, ça dort** : ne bouge plus la souris pendant 25 secondes.
- **Tout trouver** débloque le mode doré. 🌟

</details>
