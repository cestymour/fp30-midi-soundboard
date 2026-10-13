<!--
  PanelUtilityButton.svelte — Bouton icône + libellé de la barre de panneau
  (Effets, Reset)
-->
<script lang="ts">
  let { className, title, icon, label, active = false, onclick }: {
    className: string;
    title:     string;
    icon:      string;
    label:     string;
    active?:   boolean;
    onclick:   () => void;
  } = $props();
</script>

<button type="button" class={className} class:is-active={active} {title} {onclick}>
  <span class="{className}__icon">{icon}</span>
  <span class="{className}__label">{label}</span>
</button>
