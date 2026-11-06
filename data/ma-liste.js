/* ============================================================================
   🎁  MA LISTE DE NOËL — le seul fichier à modifier pour changer le contenu
   ============================================================================

   Comment ça marche ?
   -------------------
   1. "config"      → les textes du site (titre, prénom, petite lettre au Père Noël…)
                      + (facultatif) l'adresse de ton Google Sheet : "feuille"
   2. "categories"  → les rayons de ta liste (ils deviennent des boutons de filtre)
   3. "cadeaux"     → TES cadeaux. Un bloc { ... } par cadeau.
   4. "acces"       → le « mot magique » qui verrouille le site (voir plus bas)

   💡 Tu préfères éditer ta liste dans un tableau Google Sheets ? Colle son adresse dans
      config.feuille : les cadeaux ci-dessous ne servent alors plus que de secours.
      (Mode d'emploi pas à pas dans le README.md)

   Champs d'un cadeau :
     nom          (obligatoire) Le nom du cadeau
     categorie    (obligatoire) L'id d'une catégorie ci-dessous (ex. "techno")
     priorite     1 = petit plaisir · 2 = j'en rêve · 3 = LE cadeau de mes rêves
    prix         Un nombre (ex. 59.9) ou un texte libre (ex. "à partir de 50 €") — ou laisse vide
     lien         L'adresse de la page du produit — ou laisse vide
     emoji        Un emoji (ex. "🎧") OU l'adresse d'une photo du produit (ex. "https://…/casque.jpg",
                  formats png, jpg, webp, gif, avif…). Une photo remplace l'emoji.
     image        (facultatif) Pareil que "emoji" : l'adresse d'une photo
     description  Une phrase pour donner envie ou préciser
     note         Une précision pratique (taille, couleur, version…)
     reserve      true si quelqu'un s'en occupe déjà (le cadeau reçoit un tampon "Réservé")
     couleur      (facultatif) force la couleur de l'emballage de CE cadeau : "rouge", "vert", "bleu", "violet", "or", "rose" ou "candy"

   Thèmes de papier cadeau pour les catégories :
     "rouge" · "vert" · "bleu" · "violet" · "or" · "rose" · "candy"
   ============================================================================ */

window.NOEL = {

  config: {
    titre: "Ma Liste de Noël",
    sousTitre: "Chut… ici se cachent mes plus beaux souhaits. Déballe les paquets pour les découvrir !",
    prenom: "Ilan",        // sert à signer la lettre au Père Noël (laisse vide pour « Un enfant très sage »)
    devise: "EUR",         // "EUR", "USD", "CHF"…

    // Google Sheets (facultatif) : colle ici le lien « Publier sur le Web → CSV » de ton tableau.
    // Laisse vide ("") pour utiliser les cadeaux écrits dans ce fichier.
    feuille: "https://docs.google.com/spreadsheets/d/1pU7vype3KF-H_8Flhl2P6_ih71GeT9ZraD6R_U0dIB4/edit?usp=sharing",

    // Affiche un bandeau « exemples » tant que ta vraie liste n'est pas en place.
    // → Mets false dès que tu as remplacé les cadeaux ci-dessous.
    exemples: false,

    // Couleurs des emballages :
    //   "alterne"   → les couleurs se suivent dans l'ordre d'affichage (jamais deux pareils côte à côte)
    //   ["rouge", "vert", "or"] → alterne seulement ces couleurs (choix : rouge, vert, bleu, violet, or, rose, candy)
    //   "categorie" → la couleur dépend de la catégorie (voir "theme" de chaque catégorie plus bas)
    couleurs: "alterne",

    // 🎄 Calendrier de l'Avent : le bouton en bas à gauche + une animation spéciale chaque jour
    // du 1er au 25 décembre. DÉSACTIVÉ pour l'instant (rien n'a été supprimé) :
    // mets true pour le remettre.
    avent: false,

    // La lettre qui ouvre la liste. Un texte par paragraphe.
    lettre: [
      "Voici ma petite liste. Clique sur un paquet pour le déballer et découvrir tous les détails. Merci pour tout, et joyeux Noël !"
    ]
  },

  // 🔒 Verrou léger : le site ne s'ouvre que si l'adresse se termine par  ?mot-magique
  //    ex.  https://ilanbs14.github.io/Liste/?guimauve-givree
  //    Le mot n'est PAS écrit ici, seulement son empreinte. Pour en changer, ouvre outils/mot-de-passe.html.
  //    (Sécurité légère : elle écarte les curieux, pas un pirate. Voir le README.)
  acces: {
    actif: true,
    hash: "b0de513baf253ac1e1d956d43b2a43fb6f20c5d01bf83e432657966e224b780e",
    memoriser: true        // true : après un premier accès réussi, le lien sans mot marche sur cet appareil
  },

  categories: [
    { id: "techno",   nom: "High-Tech",     emoji: "🎧", theme: "bleu"   },
    { id: "mode",     nom: "Mode",          emoji: "🧣", theme: "rouge"  },
    { id: "maison",   nom: "Cocooning",     emoji: "🕯️", theme: "or"     },
    { id: "loisirs",  nom: "Jeux & Loisirs", emoji: "🎲", theme: "vert"   },
    { id: "gourmand", nom: "Gourmandises",  emoji: "🍫", theme: "rose"   }
  ],

  // ⚠️ Ce sont des EXEMPLES pour montrer le rendu — à remplacer par ta vraie liste.
  cadeaux: [
    {
      nom: "Casque audio sans fil",
      categorie: "techno",
      priorite: 3,
      prix: 129.9,
      emoji: "🎧",
      description: "Pour s'isoler du monde en musique, avec réduction de bruit.",
      note: "Couleur noire de préférence.",
      lien: "https://example.com/casque"
    },
    {
      nom: "Écharpe en laine douce",
      categorie: "mode",
      priorite: 1,
      prix: 35,
      emoji: "🧣",
      description: "Épaisse, chaude, et assez longue pour faire trois tours.",
      note: "Rouge, vert sapin ou gris chiné.",
      lien: "https://example.com/echarpe"
    },
    {
      nom: "Bougie « Forêt enneigée »",
      categorie: "maison",
      priorite: 2,
      prix: 22,
      emoji: "🕯️",
      description: "Une odeur de sapin et de vanille pour les soirées sous le plaid.",
      lien: "https://example.com/bougie"
    },
    {
      nom: "Jeu de société pour les soirées d'hiver",
      categorie: "loisirs",
      priorite: 2,
      prix: 34.9,
      emoji: "🎲",
      description: "À partir de 2 joueurs. Idéal pour battre la famille.",
      lien: "https://example.com/jeu"
    },
    {
      nom: "Coffret de chocolats chauds",
      categorie: "gourmand",
      priorite: 1,
      prix: 19.9,
      emoji: "🍫",
      description: "Six saveurs à déguster avec des guimauves.",
      reserve: true,
      lien: "https://example.com/chocolat"
    },
    {
      nom: "Chaussettes de Noël (très) moches",
      categorie: "mode",
      priorite: 1,
      prix: 9.9,
      emoji: "🧦",
      description: "Plus elles clignotent, mieux c'est.",
      note: "Taille 40-45."
    },
    {
      nom: "Le jeu vidéo de l'année",
      categorie: "loisirs",
      priorite: 3,
      prix: 59.99,
      emoji: "🎮",
      description: "Celui dont tout le monde parle et que je n'ai pas encore.",
      note: "Sur la console de salon.",
      lien: "https://example.com/jeu-video"
    },
    {
      nom: "Enceinte portable étanche",
      categorie: "techno",
      priorite: 2,
      prix: 79,
      emoji: "🔊",
      description: "Pour la douche, le jardin et les pique-niques.",
      lien: "https://example.com/enceinte"
    },
    {
      nom: "Surprends-moi !",
      categorie: "gourmand",
      priorite: 1,
      emoji: "🎁",
      description: "Carte blanche au Père Noël (et à ton imagination)."
    }
  ]
};
