# Dessins SVG des tuiles : essai en cours

> **Statut : essai, sur la branche `essai-icones-svg`.** Les dessins sont à valider sur la tablette avant de passer sur `main`. Les règles de choix et de style sont dans `docs/sons.md` (« Dessins SVG »).

## Où en est l'essai

Un sélecteur temporaire en bas de l'écran (`IconModeSwitch.svelte`, `src/ui/icon-mode.svelte.ts`) passe d'un affichage à l'autre :

1. **Emoji** : l'état de la version en production, tous les emojis.
2. **Emoji + SVG** (choix par défaut) : les tuiles qui ont un dessin l'affichent, les autres gardent leur emoji.

Avant de passer sur `main` : retirer le sélecteur (le composant, son module, la ligne dans `App.svelte` et le mode dans `TileIcon.svelte`), puis supprimer ce fichier.

## Tuiles dessinées (43 tuiles)

| Onglet | Tuiles (emoji remplacé → dessin) |
|---|---|
| Instruments | Harpe glissando 🪉 → harpe ; Voix jazz 🗣️ → micro rétro ; Cloches tubulaires 🔔 → tubes sur un portique ; Orgue jazz 🎼 → orgue à deux claviers ; Basse 🎸 → basse électrique ; Harmonica 🎵 ; Xylophone 🥢 ; Grosse caisse 🥁 → grosse caisse et mailloche ; Cuivres 📯 → trompette de héraut à bannière ; Guitare 🎸 → guitare classique ; Laser / Synth 🔆 → synthé et rayons ; Piano électrique 💎 → planète à anneau ; Flûte 🪈 → flûte traversière ; Flûte de Pan 🎋 ; Saxo soprano 🎷 → saxo droit ; Chœur 🎶 → trois choristes ; Rhodes 🎹 → télé rétro |
| Sons MIDI | Ruisseau 🏞️ → ruisseau en zigzag, qui s'élargit en descendant ; Pas 👣 → traces de chaussures (beige clair, visibles sur fond sombre) ; Bloc de bois 🪵 ; Cloche de vache 🔔 → cloche à sangle ; Grincement porte 🚪 → porte entrouverte sur le noir ; Claque ! 🚪 → porte fermée qui tremble ; Pistolet laser 🔫 → pistolet de science-fiction ; Coup de feu 🔫 → revolver qui tire ; Mitraillette 🔫 → mitraillette à chargeur rond |
| Animaux | Pigeon 🕊️ ; Hyène 🐆 ; Âne 🫏 ; Chat : Ronron 🐈 → chat en boule ; Mouette 🦤 ; Moustique 🐝 (tuile « Abeille » renommée « Moustique », le son est un moustique) |
| Bruits | Verre d'eau 🥛 → verre qu'on remplit ; Machine à café ☕ → machine à expresso ; Machine à écrire 📝 ; Erreur Windows 🖥️ → fenêtre d'erreur ; Tronçonneuse 🪚 ; Briquet 🚬 → briquet allumé ; Ba-dum-tss 🎭 → caisse claire et cymbale ; Scie à métaux 🪛 |
| Ambiances | Cigales 🦗 → cigale vue de dessus ; Vagues et mouettes ⚓ ; Grotte 💧 → grotte, goutte et ronds dans l'eau |

## Onglets

Instruments 🎹 → clavier ; Sons MIDI 🔊 → haut-parleur ; Animaux 🐮 → empreinte de patte ; Bruits ⚡ → explosion de bande dessinée ; Ambiances 🏙️ → paysage (collines, soleil, nuage) ; Musiques 🎼 → double croche ; Films 🎬 → clap. Champ `svg` de l'onglet, affiché par `TabNav.svelte` ; le sélecteur d'essai agit aussi sur les onglets.

## Dessins écartés, gardés

Ces dessins restent dans `src/icons/` et en commentaire sur leur tuile (`/* svg: '<nom>', */`) : pour en remettre un, il suffit de retirer le commentaire.

- Harpe (onglet Instruments, à côté du piano) : `harpe`, gardé sur Harpe glissando.
- Démarrage voiture : `cle-voiture` (clé trop compliquée).
- Freinage : `pneu-freinage` (dessin trop compliqué).
- Sonnette : `sonnette`.
- Basse : `contrebasse` (le son est une basse électrique).

## À voir plus tard

- **Épées** ⚔️ : sur la tablette, l'emoji s'affiche plus petit que les autres et trop simple. Il sert aussi aux titres de catégorie « Royaume / Médiéval » et « Bagarre ».
- **Titres de catégorie** : ils n'acceptent pas encore de dessin (seulement les tuiles).
