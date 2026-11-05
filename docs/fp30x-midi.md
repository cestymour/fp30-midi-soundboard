# FP-30X : ce que le piano accepte en MIDI

Relevé des essais faits le 2026-11-05 (Edge sous Windows, piano en Bluetooth, messages envoyés depuis la console avec `sendMidi()`), complété par l'implémentation MIDI officielle (`docs/DOC_FP30X/FP-30X_MIDI_Imple_eng01_W.pdf`) et le manuel (`FP-30X_fra04_W.pdf`).

## Deux parties sonores distinctes

- **Canal 4 : le son du clavier.** Un Bank Select (CC0, CC32) suivi d'un Program Change envoyé sur le canal 4 change le son que joue le clavier lui-même, et le voyant de catégorie du piano suit. Vérifié avec des sons GM2 (`msb:121` : trompette, chien, orgue d'église, harpe), des sons Roland (Jazz Scat, Pipe Organ, Harpiness) et la batterie (`msb:120`). Un son choisi ensuite sur le piano reprend la main, et un nouveau patch la reprend à son tour.
- **Canal 1 (et les autres) : une partie GM2 séparée**, qui ne joue que ce qu'elle reçoit en MIDI. C'est elle que l'application règle jusqu'en 1.7.x, d'où le son du clavier en double, le Local Off fait à la main et le renvoi des notes (loopback) : voir le bug n° 8 de `docs/bugs.md`.

## Contrôles vérifiés sur le canal 4

| Message | Effet sur le canal 4 |
|---------|----------------------|
| CC7 (volume) | oui |
| CC74 (cutoff) | oui |
| CC91 (réverbération) | **aucun** : la réverbération du clavier est le réglage Ambiance (ci-dessous) |
| CC93, 71, 72, 73, 75 | pas encore testés |

Sur le canal 1, le CC91 agit normalement.

## Messages que le piano ne reçoit pas

- **Local Control (CC122)** : envoyé par le piano (raccourci Function + fa le plus grave), mais pas reçu (tableau p. 17). L'application ne peut pas couper le son du clavier par ce message.
- Le piano n'envoie pas d'Active Sensing.
- All Notes Off (CC123) laisse sonner les notes tenues par la pédale ; All Sound Off (CC120) coupe tout.

## SysEx Roland (non documenté par Roland)

Format et adresses décodés sur le FP-30 par le projet [fp30remote](https://github.com/bluebrother/fp30remote) ; l'identifiant de modèle et les deux adresses ci-dessous marchent aussi sur le FP-30X.

```
F0 41 10 00 00 00 28 12  aa aa aa aa  dd…  cs  F7
                     DT1 adresse      valeur(s)
```

- `cs` (somme de contrôle Roland) : `(0x80 - (somme des octets d'adresse et de valeur) % 0x80) & 0x7F`.
- `01 00 03 06` = `01` : active le contrôle à distance. Sans lui, le piano ignore les réglages envoyés. Le piano en sort à l'extinction.
- `01 00 02 1A` : **Ambiance**, 0 à 10 sur le FP-30X (0 à 4 sur le FP-30). Vérifié : 10 donne une forte réverbération, 0 la supprime.
- Autres adresses relevées sur le FP-30 par fp30remote, non testées sur le FP-30X : brillance `01 00 02 1C`, volume général `01 00 02 13`, transposition `01 00 03 07`, tempo du métronome `01 00 03 09`.

En Bluetooth, chaque octet de statut d'un SysEx, y compris le `F7` final, doit être précédé d'un octet d'horodatage : `[en-tête, horodatage, F0, …, cs, horodatage, F7]`. Un paquet ne doit pas dépasser la taille négociée (20 octets par défaut) ; au-delà, il faut le découper (paquets de continuation, sans horodatage en tête). En USB, Web MIDI ne transmet un SysEx que si l'accès a été demandé avec `sysex: true`, ce qui déclenche une demande d'autorisation dans Chrome.
