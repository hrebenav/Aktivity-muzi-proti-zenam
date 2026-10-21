# Aktivity: holky vs. kluci 🎲

Webová stránka k deskové hře Aktivity, kde hrají holky proti klukům.
Holky kreslí, předvádějí a popisují věci z mužského světa, kluci z ženského.
Slova a obrázky vymýšlejí sami hráči.

## Stránky

| Adresa | K čemu |
| --- | --- |
| `/` | **Odkaz pro kamarády.** Vyberou holka/kluk a přidávají slova na kreslení, pantomimu a obrázky k popisování. Cizí příspěvky nevidí. |
| `/#/prehled` | Jen počty slov a obrázků u každého týmu a aktivity (⚠️ = méně než 10). |
| `/#/hra` | Během hry: kdo je na tahu + na jaké políčko stoupl → náhodné slovo / obrázek od druhého týmu. Použité už znovu nepadne. |
| `/#/sprava` | Skrytá správa (nenápadný odkaz dole na přehledu): zobrazí celý obsah a dovolí mazat. |

Pravidla aplikace:

- Duplicity se automaticky přeskočí (nezáleží na velikosti písmen ani diakritice; u obrázků se pozná stejný soubor).
- Tlačítko **Další** smí hráč použít jen tehdy, když nahlas řekne „Další!“. Instrukce je přímo u karty.
- **Nová hra** vrátí všechna použitá slova zpět do hry.
- Když dojdou slova, jde losovat i z už použitých.

## Zprovoznění (jednorázově, cca 10 minut)

### 1. Databáze Supabase (zdarma)

1. Na <https://supabase.com> se přihlas (stačí přes GitHub) a dej **New project**. Název třeba `aktivity`, heslo si vygeneruj, region `Central EU (Frankfurt)`.
2. Až se projekt vytvoří, otevři vlevo **SQL Editor**, vlož celý obsah souboru [`supabase-setup.sql`](supabase-setup.sql) a klikni **Run**.
3. Vlevo **Project Settings → API** (nebo **Data API**) zkopíruj:
   - **Project URL** (např. `https://abcd1234.supabase.co`)
   - **anon public** klíč (dlouhý text začínající `eyJ…`)
4. Obojí vlož do souboru [`config.js`](config.js) (nebo to pošli Claudovi a doplní to).

Anon klíč je veřejný a smí být v repozitáři. Dokud je `config.js` prázdný, stránka běží v DEMO režimu a data ukládá jen v daném prohlížeči.

### 2. Zveřejnění přes GitHub Pages

1. V repozitáři na GitHubu: **Settings → Pages**.
2. **Source:** *Deploy from a branch*, **Branch:** `main`, složka `/ (root)` → **Save**.
3. Za minutu bude stránka na `https://hrebenav.github.io/Aktivity-muzi-proti-zenam/`.

Kamarádům posílej jen tuhle základní adresu. Přehled je na konci `#/prehled`, hra na `#/hra`.

## Technicky

Čisté HTML/CSS/JS bez sestavování (`index.html`, `app.js`, `styles.css`). Data jsou v tabulce `polozky` v Supabase.
Obrázky se před nahráním zmenší na max. 1280 px (JPEG) a uloží přímo do databáze.
Lokálně stačí spustit `python3 -m http.server` a otevřít <http://localhost:8000>.
