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
  /** Emoji affiché dans l'onglet */
  icon: string;
  /** Couleur d'accent de l'onglet et de son panneau */
  accent: string;
  categories: Category<Item>[];
}

// ═══════════════════════════════════════════════════════
// MIDI
// ═══════════════════════════════════════════════════════

export interface MidiItem {
  id: ConfigId;
  name: string;
  icon: string;
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
  /** Classe CSS de couleur de catégorie (onglet animaux) */
  catClass?: string;
}

export type AudioCategory = Category<AudioItem>;

export interface AudioTab extends TabBase<AudioItem> {
  /** Affichage en colonnes avec titres de catégorie (si > 1) */
  cols?: number;
  /** Grille spéciale animaux (4×8 en paysage, 8×4 en portrait) */
  gridType?: 'animals';
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
  /** Étiquette courte en haut de la carte (ex. 'REV') */
  label: string;
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
