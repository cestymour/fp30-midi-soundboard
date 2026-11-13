/* ================================================================
   types.ts — Types partagés : configuration des onglets, contrôles
              et presets des popups d'effets
   Le schéma de configuration est documenté dans README.md.
================================================================ */

// ═══════════════════════════════════════════════════════
// ONGLETS — structure commune onglet → catégories → tuiles
// ═══════════════════════════════════════════════════════

/**
 * Identifiant stable d'un onglet, d'une catégorie ou d'une tuile :
 * slug court, unique parmi ses frères, qui ne change plus même si le
 * libellé, le fichier ou le patch changent.
 */
export type ConfigId = string;

export interface Category<Item> {
  id: ConfigId;
  label: string;
  icon?: string;
  /** Couleur du titre de catégorie */
  color?: string;
  items: Item[];
}

interface TabBase<Item> {
  id: ConfigId;
  label: string;
  /** Emoji affiché dans l'onglet (la couleur vient du type d'onglet : voir TAB_ACCENTS) */
  icon: string;
  /** Dessin de src/icons/ (nom du fichier sans `.svg`), affiché à la place de l'emoji `icon` */
  svg?: string;
  categories: Category<Item>[];
}

// ═══════════════════════════════════════════════════════
// MIDI
// ═══════════════════════════════════════════════════════

export interface MidiItem {
  id: ConfigId;
  name: string;
  icon: string;
  /** Dessin de src/icons/ (nom du fichier sans `.svg`), affiché à la place de l'emoji `icon` */
  svg?: string;
  /** Program Change, 1-128 (notation musicale) : envoyé en `pc - 1` */
  pc: number;
  /** Bank Select MSB (CC0) */
  msb: number;
  /** Bank Select LSB (CC32) */
  lsb: number;
  /** Infobulle (par défaut : `name`) */
  title?: string;
}

export type MidiCategory = Category<MidiItem>;

export interface MidiTab extends TabBase<MidiItem> {
  /** Nombre de colonnes de la grille (défaut : 5) */
  cols?: number;
}

// ═══════════════════════════════════════════════════════
// AUDIO
// ═══════════════════════════════════════════════════════

export interface AudioItem {
  id: ConfigId;
  name: string;
  /** Emoji ou chemin vers une image */
  icon?: string;
  /** Dessin de src/icons/ (nom du fichier sans `.svg`), affiché à la place de l'emoji `icon` */
  svg?: string;
  /** Chemin du fichier audio, relatif à la page (fichiers dans public/) */
  file: string;
  /** Image de couverture (remplace `icon`) */
  img?: string;
  /** Début de lecture, en secondes */
  start?: number;
  /** Fin de lecture, en secondes */
  end?: number;
  /** Infobulle (par défaut : `name`) */
  title?: string;
  /** Ligne en petit sous le nom (ce que la musique fait entendre, ou la situation) */
  subtitle?: string;
  /** Onglets musiques : pas de fondu d'entrée, la musique démarre tout de suite au volume choisi.
   *  Inutile dans les onglets sons, qui n'ont jamais de fondu. */
  noFade?: boolean;
  /** Classe CSS de couleur de catégorie (onglet animaux) */
  catClass?: string;
}

export type AudioCategory = Category<AudioItem>;

/**
 * Type d'un onglet audio :
 * - `sounds` (sons courts : Animaux, Bruits) : chaque clic lance une nouvelle voix, qui se
 *   superpose à la musique et aux autres sons ; ni fondu, ni effets ; volume des sons ;
 * - `music` (musiques : Ambiances, Musiques, Films) : une seule musique à la fois, commune
 *   aux onglets musiques, avec fondus, effets audio et volume des musiques.
 */
export type AudioTabKind = 'sounds' | 'music';

/** Type d'onglet : décide de la couleur de l'onglet et de son panneau */
export type TabKind = 'midi' | AudioTabKind;

export interface AudioTab extends TabBase<AudioItem> {
  kind: AudioTabKind;
  /** Affichage en colonnes avec titres de catégorie (si > 1) */
  cols?: number;
  /** Mode colonnes : nombre de tuiles par ligne dans une catégorie (3 par défaut).
   *  Les tuiles prennent alors la couleur de leur catégorie (variable --cat-accent). */
  catCols?: number;
  /** Mode colonnes : nombre de catégories dans chaque colonne, dans l'ordre (ex. [2, 3, 2, 2]).
   *  Par défaut, les catégories sont réparties à parts égales (ceil(catégories / cols) par colonne). */
  colSizes?: number[];
  /** Grille fixe de 32 tuiles qui remplit le panneau (4×8 en paysage, 8×4 en portrait) : Animaux, Bruits, Ambiances */
  gridType?: 'fixed';
}

// ═══════════════════════════════════════════════════════
// MUSIQUE DE TRANSITION
// ═══════════════════════════════════════════════════════

/**
 * Une musique de transition (entre deux impros) : une seule sert tout le spectacle.
 * Moments marquants : le 0 (`start`, ou le début du fichier) ouvre le spectacle ; ensuite,
 * après chaque impro, les moments 1, 2, 3… (`restarts`) à tour de rôle : 0, 1, 2, 3, 1, 2…
 */
export interface TransitionMusic extends AudioItem {
  /** Moments marquants 1, 2, 3…, en secondes (au moins un, 4 au plus en pratique) */
  restarts: number[];
}

// ═══════════════════════════════════════════════════════
// POPUPS D'EFFETS
// ═══════════════════════════════════════════════════════

/** Clés des contrôles de la popup d'effets piano (CC MIDI) */
export type MidiFxKey = 'reverb' | 'chorus' | 'cutoff' | 'resonance' | 'attack' | 'release' | 'decay';

/** Clés des contrôles de la popup d'effets audio */
export type AudioFxKey = 'bass' | 'mid' | 'treble' | 'lowPass' | 'highPass' | 'reverb' | 'delay' | 'speed';

/** Un curseur d'une popup d'effets */
export interface FxControl<Key extends string, Settings> {
  key: Key;
  /** Nom affiché sous le curseur */
  shortLabel: string;
  group: string;
  min: number;
  max: number;
  step: number;
  /** Valeur « sans effet » : cible du reset et des contrôles absents d'un preset */
  neutral: number;
  /** Lit la valeur du curseur dans l'état courant */
  read: (settings: Settings) => number;
  /** Applique la valeur (envoi MIDI ou réglage du moteur audio) */
  apply: (value: number) => void;
  /** Valeur lisible (ex. « 4,2 kHz ») : pas affichée, donnée aux lecteurs d'écran (aria-valuetext) */
  formatValue: (value: number) => string | number;
}

/** Un bouton de preset d'une popup d'effets */
export interface FxPreset<Key extends string> {
  key: string;
  icon?: string;
  text: string;
  /**
   * Valeurs des contrôles modifiés par le preset ; les autres reviennent à
   * leur `neutral`. `null` : preset de reset.
   */
  values: Partial<Record<Key, number>> | null;
}
