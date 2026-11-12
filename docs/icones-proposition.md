# Icônes SVG des tuiles : proposition de travail

> **Statut : proposition de Claude, pas validée par l'utilisateur.** Le choix des images, tuile par tuile, sera largement revu avant d'être dessiné. Ce fichier garde la trace de l'essai pour reprendre le travail plus tard.

## Où en est l'essai

Branche `essai-icones-svg`. Huit tuiles ont un dessin (`svg: '<nom>'` dans la config) : Piano, Accordéon, Rhodes, Piano Saloon (Instruments), Pigeon, Mouette, Corbeau, Chat : Ronron (Animaux). Les autres tuiles gardent leur emoji. Un sélecteur temporaire en bas de l'écran (`IconModeSwitch.svelte`, `src/ui/icon-mode.svelte.ts`) passe d'un affichage à l'autre :

1. **Emoji** : l'état actuel.
2. **Détaillé** (`src/icons/*.svg`) : l'objet dessiné en couleurs, avec beaucoup de détails. Rejeté pour les instruments : trop d'informations, lent à lire, illisible en petit sur un téléphone. Bon niveau pour les oiseaux.
3. **Simple** (`src/icons/simple/`) : silhouette pleine d'une seule couleur, celle de la catégorie. Rejeté : pas assez d'informations, on doute de ce qu'on voit (la mouette ressemble à une vague), et la couleur réelle aide à reconnaître (un éléphant, on le cherche gris).
4. **V4** (`src/icons/v4/`) : retenue comme direction. Voir les règles ci-dessous.

Avant de généraliser : retirer le sélecteur et les styles écartés, ne garder qu'un dossier de dessins.

## Règles retenues (après l'essai V4)

- **Niveau de détail d'un emoji** : quelques formes, quelques tons, pas de fioriture. Les dessins se mélangent alors aux emojis restants sans détonner : on peut passer aux SVG petit à petit.
- **Vraies couleurs** : l'objet garde ses couleurs naturelles. Une couleur par catégorie, si on la veut, va sur le fond de la tuile, pas sur l'image.
- **Animaux et bruits : partir du son entendu**, pas de l'emoji disponible (une mouette pour le cri de mouette, pas un dodo ; un pigeon, pas une colombe).
- **Instruments : l'image évoque la situation, le libellé dit l'instrument.** Image et libellé donnent deux informations. Exemple : sur une scène de roi et de reine, l'œil cherche la royauté (couronne), et le libellé dit « Clavecin ». L'information de situation compte souvent plus que l'instrument, mais il faut les deux.
- Une image différente par tuile dans une même catégorie : le titre de catégorie donne déjà l'ambiance, l'image distingue la nuance.

## Proposition, tuile par tuile (onglet Instruments)

✓ = l'idée de l'emoji actuel est gardée, seulement redessinée. ⚠ = à préciser par l'utilisateur (dans quelle scène il joue ce son).

**Romantique / Amour** 🌹
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Piano | 🎹 | un cœur | la romance en général |
| Harpe | 🪉 | des ailes d'ange | le rêve, l'amour idéal, le paradis |
| Violon solo | 🎻 | une bougie | le dîner aux chandelles |
| Accordéon | 🪗 | la tour Eiffel | Paris, la guinguette, l'amour à la française |

**Comédie / Cartoon** 🎪
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Boîte à musique | 🎠 | ✓ un cheval de manège | l'enfance, la berceuse |
| Célesta | ✨ | une baguette magique étoilée | la magie de dessin animé |
| Rhodes | 🎹 | une télé rétro ⚠ | la sitcom des années 70 |
| Voix jazz | 🗣️ | un micro rétro ⚠ | le scat, le crooner |

**Sacré / Mariage** ⛪
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Orgue d'église | ⛪ | ✓ une église (clocher et croix) | la messe, l'enterrement |
| Gospel | ✝️ | deux mains levées | la ferveur, la louange |
| Cloches tubulaires | 🔔 | deux alliances | le mariage |
| Clochettes Noël | 🎄 | ✓ un sapin | Noël |

**Jazz / Années 50-60** 🎷
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Orgue jazz | 🎼 | un verre à cocktail | le club, le lounge |
| Trompette | 🎺 | un chapeau mou (fedora) ⚠ | le film noir, le détective |
| Basse | 🎸 | des traces de pas | la filature, la marche sur la pointe des pieds |
| Saxo | 🎷 | des lèvres | la séduction |

**Western / Saloon** 🤠
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Piano Saloon | 🤠 | les portes battantes du saloon | le saloon |
| Harmonica | 🎵 | un feu de camp | le cowboy solitaire le soir |
| Banjo | 🪕 | une botte de foin | la campagne, la ferme, les péquenauds |
| Guitare jazz | 🎸 | un cactus ⚠ | le désert, la balade |

**Percussions** 🥁
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Xylophone | 🥢 | un squelette (ou un os) ⚠ | le gag de dessin animé |
| Tom mélodique | 🪘 | une feuille de jungle | la tribu, l'aventure |
| Percu (kit) | 🥁 | une cymbale avec un éclat | le « ba-dum-tss » de la blague |
| Grosse caisse | 🥁 | un éclair | le coup de théâtre, le tonnerre |

**Royaume / Médiéval** ⚔️
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Clavecin | 👑 | ✓ une couronne | la cour, le roi, la reine |
| Cuivres | 📯 | un parchemin déroulé | la proclamation, « Oyez ! », l'entrée du roi |
| Guitare | 🎸 | un chapeau à plume | le troubadour, la sérénade |
| Flûte médiévale | 🌿 | une chope | la taverne, la fête au village |

**Futuriste / SF** 🚀
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Laser / Synth | 🔆 | une soucoupe volante | les extraterrestres |
| Fantasia | 🚀 | ✓ une fusée | le voyage spatial |
| Piano électrique | 💎 | une planète à anneau | la rêverie dans l'espace |
| Pluie de cristal | ❄️ | ✓ un flocon ou un cristal | la glace, la magie froide |

**Fantastique / Féérique** 🧚
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Flûte | 🪈 | un champignon | la forêt enchantée, les contes |
| Flûte de Pan | 🎋 | des montagnes ⚠ | les grands espaces, les Andes |
| Kalimba | 🧝 | des lucioles | la nuit magique |
| Saxo soprano | 🎷 | un arc-en-ciel ⚠ | le rêve, le merveilleux |

**Mystère / Suspense** 🌙
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Pad boréal | 🌌 | des étoiles | la nuit, l'immensité |
| Pad légendaire | 🌙 | ✓ un croissant de lune | la légende, la nuit |
| Cordes Tron | 🔮 | ✓ une boule de cristal | la voyante, l'énigme |
| Voix céleste | 👁️ | ✓ un œil | on est observé, le mystère |

**Musique du monde** 🌍
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Shamisen | 🎌 | un torii (portique japonais) | le Japon |
| Steelpan | 🌴 | ✓ un palmier | les Caraïbes |
| Sitar | 🕌 | un dôme de palais indien | l'Inde |
| Harpe glissando | 🪉 | un nuage ⚠ | le rêve, le flashback (plus qu'une musique du monde) |

**Horreur / Angoisse** 👻
| Instrument | Emoji actuel | Image | Ce qu'elle évoque |
|---|---|---|---|
| Nappe sombre | 🌀 | une toile d'araignée | la tension qui monte, la maison hantée |
| Gobelins | 👹 | un chaudron | la sorcière, le monstre |
| Halo | 😱 | un fantôme (drap) | l'apparition |
| Chœur | 🎶 | un crâne | la messe noire, la mort |
