<!--
  IconModeSwitch.svelte — ESSAI TEMPORAIRE : quatre boutons en bas de l'écran pour passer
  d'un affichage des icônes de tuile à l'autre (emoji, dessin détaillé, silhouette simple, V4).
  À retirer une fois le style choisi.
-->
<script lang="ts">
  import { iconMode, setIconMode, type IconMode } from '../icon-mode.svelte.ts';

  const MODES: { mode: IconMode; label: string }[] = [
    { mode: 'emoji',  label: '1 · Emoji' },
    { mode: 'detail', label: '2 · Détaillé' },
    { mode: 'simple', label: '3 · Simple' },
    { mode: 'v4',     label: '4 · V4' },
  ];
</script>

<div class="icon-mode-switch" role="group" aria-label="Essai : affichage des icônes">
  {#each MODES as { mode, label } (mode)}
    <button class:active={iconMode.value === mode} onclick={() => setIconMode(mode)}>{label}</button>
  {/each}
</div>

<style>
  .icon-mode-switch {
    position: fixed;
    left: 50%;
    bottom: 6px;
    transform: translateX(-50%);
    z-index: 900;
    display: flex;
    gap: 4px;
    padding: 4px;
    background: rgba(10, 10, 14, 0.92);
    border: 1px solid #ff9f43;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  }
  button {
    padding: 6px 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 600;
    color: #c8cbd8;
    background: #23252e;
    border: 1px solid #3a3d4a;
    border-radius: 5px;
    cursor: pointer;
  }
  button.active {
    color: #14151a;
    background: #ff9f43;
    border-color: #ff9f43;
  }
</style>
