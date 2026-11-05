/* ============================================================================
   🎁  MA LISTE DE NOËL — le seul fichier à modifier pour changer le contenu
   ============================================================================

   Comment ça marche ?
   -------------------
   1. "config"      → les textes du site (titre, prénom, petite lettre au Père Noël…)
   2. "categories"  → les rayons de ta liste (ils deviennent des boutons de filtre)
   3. "cadeaux"     → TES cadeaux. Un bloc { ... } par cadeau.

   Champs d'un cadeau :
     nom          (obligatoire) Le nom du cadeau
     categorie    (obligatoire) L'id d'une catégorie ci-dessous (ex. "techno")
     priorite     1 = petit plaisir · 2 = j'en rêve · 3 = LE cadeau de mes rêves
     prix         Un nombre, sans le symbole (ex. 59.9) — ou laisse vide
     lien         L'adresse de la page du produit — ou laisse vide
     emoji        Un emoji pour illustrer (ex. "🎧")
     image        (facultatif) L'adresse d'une photo, elle remplace l'emoji
     description  Une phrase pour donner envie ou préciser
     note         Une précision pratique (taille, couleur, version…)
     reserve      true si quelqu'un s'en occupe déjà (le cadeau reçoit un tampon "Réservé")

   Thèmes de papier cadeau pour les catégories :
     "rouge" · "vert" · "bleu" · "violet" · "or" · "rose" · "candy"
   ============================================================================ */

window.NOEL = {

  config: {
    titre: "Ma Liste de Noël",
    sousTitre: "Chut… ici se cachent mes plus beaux souhaits. Déballe les paquets pour les découvrir !",
    prenom: "Ilan",        // sert à signer la lettre au Père Noël (laisse vide pour « Un enfant très sage »)
    devise: "EUR",         // "EUR", "USD", "CHF"…

    // Affiche un bandeau « exemples » tant que ta vraie liste n'est pas en place.
    // → Mets false dès que tu as remplacé les cadeaux ci-dessous.
    exemples: true,

    // La lettre qui ouvre la liste. Un texte par paragraphe.
    lettre: [
      "Cette année, j'ai été (presque) toujours sage — surtout les jours où personne ne regardait.",
      "Voici ma petite liste. Clique sur un paquet pour le déballer et découvrir tous les détails. Merci pour tout, et joyeux Noël !"
    ]
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
