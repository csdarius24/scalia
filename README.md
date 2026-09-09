# SCIALLA — landing page (tervezet)

Egyoldalas, konverzióközpontú landing page a SCIALLA coaching márkának.
Statikus HTML + CSS + ~120 sor JavaScript. Nincs build-lépés, nincs függőség.

---

## Fájlok

```
index.html            a landing page (12 szekció)
adatvedelem.html      jogi aloldal (kitöltendő)
impresszum.html       jogi aloldal (kitöltendő)
vercel.json           biztonsági fejlécek + cache
.vercelignore         mi NEM kerül fel a deployra
.gitignore            mi NEM kerül fel a GitHubra
assets/
  styles.css          teljes design rendszer, CSS custom property tokenekkel
  script.js           scroll-reveal, sticky header, mobil CTA sáv, aktív menüpont
  img/favicon.svg
_ajanlat/             árajánlat — se a GitHubra, se a deployra nem kerül fel
```

---

## Helyi megtekintés

```bash
python -m http.server 4321
```

Utána: `http://localhost:4321`

---

## Kitelepítés

A repo Vercelhez van kötve, tehát elég pusholni:

```bash
git add -A && git commit -m "Landing page" && git push
```

Kézi deployhoz: `npx vercel --prod`

---

## Az oldal szerkezete

| # | Szekció | Layout |
|---|---|---|
| 01 | Hero | aszimmetrikus split, portré jobbra kifutva |
| 02 | Miben segítek | hajszálvonalas sorindex |
| 03 | Kinek szól | Nebbia sáv, sticky cím + kétszintű lista |
| 04 | Hogyan dolgozunk | négylépéses idővonal |
| 05 | Képsáv | teljes szélességű fotó, 21:9 |
| 06 | Rólam | tükrözött split, kép balra kifutva |
| 07 | Szemlélet | teljes szélességű sötét sáv, egy mondat |
| 08 | Vélemények | tipográfiai idézetek, kártya nélkül |
| 09 | Mit / mit nem | kétoszlopos szedés |
| 10 | Gyakori kérdések | Nebbia sáv, natív `<details>` harmonika |
| 11 | Első beszélgetés | az oldal egyetlen panelje |
| 12 | Időpontfoglalás | nagy tipográfiai blokk |

---

## Fotók — FONTOS

A demóban **Unsplash-fotók vannak beágyazva közvetlen CDN-linkkel** (nincsenek
letöltve a repóba). Az Unsplash-licenc ezt megengedi, kereskedelmi célra is,
külön feltüntetés nélkül.

| Hol | Kép |
|---|---|
| Hero | `photo-1745434159123-4908d0b9df94` |
| Képsáv | `photo-1679215805585-bd03a616d807` |
| Rólam | `photo-1728931710079-5fff6ae56b89` |

**Élesítés előtt cserélni kell** — két okból: egyrészt a coach valódi arca
sokkal többet konvertál bármilyen stockfotónál, másrészt külső CDN-ről
betölteni képet éles oldalon törékeny (ha az Unsplash változtat, a kép eltűnik).

A csere menete: tedd a fotókat az `assets/img/` mappába, és írd át az `index.html`
három `<img>` blokkját. Mindegyiket `<!-- CSERE: ... -->` komment jelöli.
Javasolt méret: 1600 × 2000 px (portré) és 2400 × 1030 px (képsáv), WebP vagy AVIF.

Amíg stockfotó van bent, a `.photo` és `.band__img` osztály egységes tónust ad
nekik (`saturate(.92) contrast(1.03)` + finom sötét lefutás), hogy a paletta
része legyenek, ne vendégek benne.

---

## Amit ki kell cserélni élesítés előtt

A cserélendő helyeket az oldalon **szaggatottan aláhúzott, sárgaréz színű
`[ szögletes zárójeles ]` szöveg** jelöli — így az ügyfél is látja, mi hiányzik.

| Mi | Hol |
|---|---|
| Három fotó (lásd fent) | `index.html` `<img>` blokkok |
| A coach neve | `index.html` — „A SCIALLA mögött” blokk |
| Bemutatkozó szöveg (2 bekezdés) | `index.html` — `.prose` |
| Szakmai háttér | `index.html` — `.credentials` |
| **Vélemények** | `index.html` — `#velemenyek`; jelenleg mintaszöveg |
| Óradíj | `index.html` — GYIK első kérdése |
| Helyszín | `index.html` — a képsáv képaláírása |
| E-mail, telefon, Facebook URL | `index.html`, jogi oldalak |
| Foglalórendszer linkje | `index.html` — `#foglalas`, `<!-- CSERE -->` komment |
| Adatvédelmi és impresszum szövegek | `adatvedelem.html`, `impresszum.html` |
| OG-kép | `index.html` `<head>` — most Unsplash-linkre mutat |
| `noindex` meta törlése | mindhárom HTML `<head>` |

> **A véleményeket kötelező valódira cserélni.** Kitalált ügyfélvéleményt
> közzétenni fogyasztóvédelmi jogszabályba ütközik. A szekcióban erre
> figyelmeztető szöveg is van — azt is töröld, amikor bekerülnek a valódiak.

> Az asset-hivatkozásokon `?v=2` verziószám van. **Minden CSS/JS módosítás után
> növeld meg** (`?v=3`), különben a visszatérő látogató egy órán át a régi
> fájlt kapja a Vercel cache-éből.

---

## Design rendszer dióhéjban

| Token | HEX | Szerep |
|---|---|---|
| `--carta` | `#FAF9F7` | alap háttér |
| `--nebbia` | `#EFEEEA` | másodlagos sáv és az egyetlen panel |
| `--ink` | `#1F2A28` | szöveg, gombok, sötét sáv, footer |
| `--pietra` | `#5C6461` | másodlagos szöveg |
| `--filo` | `#DFDDD7` | hajszálvonal |
| `--ottone` | `#7F6440` | akcent világos alapon |
| `--ottone-chiaro` | `#C4A574` | akcent sötét alapon |

Betűk: **Newsreader** (címek, 200–400 súly) + **Schibsted Grotesk** (szöveg, UI).
Töréspontok: 600 / 900 / 1000 / 1200 px. Mobilon nincs hamburgermenü, helyette
alsó sticky CTA sáv jelenik meg a hero elhagyása után.

---

## Ellenőrzött viselkedés

Böngészőben, futó szerveren mérve — nem csak elméletben:

- **Nincs vízszintes görgetés** 320 / 375 / 768 / 1024 / 1440 / 1920 px-en.
- **Nincs konzolhiba**, nincs 404-es kérés, mindhárom fotó betölt.
- **A tartalom JavaScript nélkül is látszik** (a rejtett kezdőállapotot csak a
  `js` osztály kapcsolja be, plusz van egy 4 másodperces biztonsági háló).
- **A GYIK JavaScript nélkül is működik** — natív `<details>` elem.
- **`prefers-reduced-motion`** esetén minden animáció kikapcsol.
- **Minden érintési cél ≥ 44 px**, átfedés nélkül.
- **Sticky elemek** (header, „Kinek szól” és GYIK cím) mérve működnek — a `html`-en
  `overflow-x: clip` van, nem `hidden` a `body`-n, épp emiatt.
- **Aktív menüpont** követi a görgetést, szekciónként pontosan egy aktív.
- Egy `h1`, hézagmentes címhierarchia, minden képnek van `alt`-ja,
  minden horgonylink létező célra mutat.
- Képek `aspect-ratio`-val és `srcset`-tel, előre lefoglalt hellyel (nincs
  layout-ugrás).

> A `.claude/launch.json` csak helyi előnézethez kell; se a GitHubra, se a
> deployra nem kerül fel.
