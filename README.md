# SCIALLA — landing page (tervezet)

Egyoldalas, konverzióközpontú landing page a SCIALLA coaching márkának.
Statikus HTML + CSS + ~90 sor JavaScript. Nincs build-lépés, nincs függőség.

---

## Fájlok

```
index.html            a landing page
adatvedelem.html      jogi aloldal (kitöltendő)
impresszum.html       jogi aloldal (kitöltendő)
vercel.json           biztonsági fejlécek + cache
assets/
  styles.css          teljes design rendszer, CSS custom property tokenekkel
  script.js           scroll-reveal, sticky header, mobil CTA sáv
  img/
    portre-hero.svg   PLACEHOLDER — cserélendő valódi fotóra
    portre-rolam.svg  PLACEHOLDER — cserélendő valódi fotóra
    favicon.svg
```

---

## Helyi megtekintés

Elég duplán kattintani az `index.html`-en. Ha lokális szerverrel néznéd:

```bash
npx serve .
```

---

## Kitelepítés Vercelre

**A. Legegyszerűbb — drag & drop**

1. https://vercel.com/new → *Deploy* → húzd rá a `scalia` mappát.
2. Framework Preset: **Other**. Build Command: üresen. Output Directory: üresen.
3. Deploy. Kapsz egy `*.vercel.app` linket, amit küldhetsz az ügyfélnek.

**B. Vercel CLI**

```bash
npx vercel --prod
```

**C. GitHub**

Töltsd fel a mappát egy repóba, majd Vercelen *Import Git Repository*.
Minden push automatikusan új deployt indít.

---

## Amit ki kell cserélni élesítés előtt

A cserélendő helyeket az oldalon **szaggatottan aláhúzott, sárgaréz színű
`[ szögletes zárójeles ]` szöveg** jelöli — így az ügyfél is látja, mi hiányzik még.

| Mi | Hol |
|---|---|
| Két portréfotó (min. 1600 × 2000 px, WebP/AVIF) | `assets/img/` + `index.html` `<img src>` |
| A coach neve | `index.html` — „A SCIALLA mögött” blokk |
| Bemutatkozó szöveg (2 bekezdés) | `index.html` — `.prose` |
| Szakmai háttér (végzettség, képzések, tapasztalat, nyelvek) | `index.html` — `.credentials` |
| E-mail, telefonszám, Facebook URL | `index.html` (foglalás + footer), jogi oldalak |
| Foglalórendszer linkje (Cal.com / Calendly) | `index.html` — `#foglalas`, a jelölt `<!-- CSERE -->` komment |
| Adatvédelmi és impresszum szövegek | `adatvedelem.html`, `impresszum.html` |
| OG-kép (1200 × 630 px) | `index.html` `<head>` — `og:image` meta hozzáadása |
| `noindex` meta törlése | mindhárom HTML `<head>` |

> A jelenlegi állapotban minden CTA működik: a felső gombok a záró
> foglalás-blokkra ugranak, a záró gomb pedig egy előre kitöltött
> `mailto:` levelet nyit. Foglalórendszer bekötése után csak a `href`-et
> kell átírni.

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
Töréspontok: 600 / 900 / 1000 px. Mobilon nincs hamburgermenü, helyette
alsó sticky CTA sáv jelenik meg a hero elhagyása után.

---

## Ellenőrzött viselkedés

Böngészőben, futó szerveren mérve — nem csak elméletben:

- **Nincs vízszintes görgetés** 320 / 375 / 768 / 1024 / 1280 / 1920 px-en.
- **Nincs konzolhiba**, nincs 404-es kérés.
- **A tartalom JavaScript nélkül is látszik** (a rejtett kezdőállapotot csak a
  `js` osztály kapcsolja be, plusz van egy 4 másodperces biztonsági háló).
- **`prefers-reduced-motion`** esetén minden animáció kikapcsol, az idővonal
  azonnal kirajzolva jelenik meg.
- **Minden érintési cél ≥ 44 px**, a footer- és kapcsolati linkeké is,
  átfedés nélkül.
- **Sticky elemek** (header, „Kinek szól” cím) mérve működnek — a `html`-en
  `overflow-x: clip` van, nem `hidden` a `body`-n, épp emiatt.
- Egy `h1`, hézagmentes címhierarchia, minden képnek van `alt`-ja,
  minden horgonylink létező célra mutat.
- Képek `aspect-ratio`-val, előre lefoglalt hellyel (nincs layout-ugrás).

> A `.claude/launch.json` csak helyi előnézethez kell (`python -m http.server`),
> a deployt nem befolyásolja — nyugodtan törölhető.
