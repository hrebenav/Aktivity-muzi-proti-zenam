import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

// ---------- Konstanty ----------

// Ikony (Lucide, MIT)
const IKONY = {
  pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  postava: '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>',
  obrazek: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  venus: '<circle cx="12" cy="9" r="6"/><path d="M12 15v7"/><path d="M9 19h6"/>',
  mars: '<circle cx="10" cy="14" r="6"/><path d="m14.5 9.5 6.5-6.5"/><path d="M15 3h6v6"/>',
  kostky: '<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>',
  graf: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  znovu: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  dalsi: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>',
  skryto: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  kos: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  foto: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
  zpet: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  pozor: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
};

function ic(nazev) {
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IKONY[nazev]}</svg>`;
}


const KATEGORIE = {
  kresleni: { nazev: "Kreslení", ikona: ic("pencil"), co: "nepoužitá slova ke kreslení" },
  pantomima: { nazev: "Pantomima", ikona: ic("postava"), co: "nepoužitá slova k předvádění" },
  popis: { nazev: "Popisování", ikona: ic("obrazek"), co: "nepoužité obrázky k popisu" },
};

const TYM = {
  holky: { nazev: "Holky", ikona: ic("venus"), autor: "kluk" }, // holky hrají to, co přidali kluci
  kluci: { nazev: "Kluci", ikona: ic("mars"), autor: "holka" },
};

// Tlačítko „Jdeme hrát“ v přehledu. Před hrou skryté, ať si lidi losování nezkouší
// (hra je dál dostupná přímo na adrese #/hra).
const UKAZAT_HRU = false;

const LS_GENDER = "aktivity.gender";
const LS_MOJE = "aktivity.mojePocty";
const LS_TYM = "aktivity.tymNaTahu";

// ---------- Pomocné funkce ----------

const $app = document.getElementById("app");

function h(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content;
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* soukromé okno apod. – nevadí */
  }
}

let toastTimer;
function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
}

// „Řasenka “ i „rasenka“ jsou totéž slovo
function normalizuj(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.,!?;:"'„“”]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function otisk(blob) {
  const buf = await blob.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Zmenší obrázek na max. 1280 px a uloží jako JPEG
async function zmensiObrazek(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("Obrázek nejde načíst"));
      i.src = url;
    });
    const max = 1280;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- Datová vrstva ----------

function supabaseApi(client) {
  const tbl = () => client.from("polozky");
  const chyba = (error) => {
    if (error) throw new Error(error.message);
  };
  return {
    async pocty() {
      const { data, error } = await client.rpc("pocty");
      chyba(error);
      return data;
    },
    async pridejTexty(autor, kategorie, texty) {
      const rows = texty.map((text) => ({ autor, kategorie, text, klic: normalizuj(text) }));
      const { data, error } = await tbl()
        .upsert(rows, { onConflict: "autor,kategorie,klic", ignoreDuplicates: true })
        .select("klic");
      chyba(error);
      return data.length;
    },
    async pridejObrazek(autor, obrazek, klic) {
      const { error } = await tbl().insert({ autor, kategorie: "popis", obrazek, klic });
      if (error?.code === "23505") return false;
      chyba(error);
      return true;
    },
    async vylosuj(autor, kategorie, iPouzite = false) {
      const { data, error } = await client.rpc("vylosuj", {
        p_autor: autor,
        p_kategorie: kategorie,
        p_i_pouzite: iPouzite,
      });
      chyba(error);
      return data[0] ?? null;
    },
    async novaHra() {
      const { error } = await client.rpc("nova_hra");
      chyba(error);
    },
    async vsechno() {
      const { data, error } = await tbl().select("*").order("created_at");
      chyba(error);
      return data;
    },
    async smaz(id) {
      const { error } = await tbl().delete().eq("id", id);
      chyba(error);
    },
  };
}

// Demo bez databáze – vše jen v localStorage tohoto prohlížeče
function demoApi() {
  const KEY = "aktivity.demoData";
  const load = () => lsGet(KEY, []);
  const save = (rows) => lsSet(KEY, rows);
  const id = () => Math.random().toString(36).slice(2);
  return {
    async pocty() {
      const out = {};
      for (const r of load()) {
        const k = r.autor + "|" + r.kategorie;
        out[k] ??= { autor: r.autor, kategorie: r.kategorie, celkem: 0, zbyva: 0 };
        out[k].celkem++;
        if (!r.pouzito_at) out[k].zbyva++;
      }
      return Object.values(out);
    },
    async pridejTexty(autor, kategorie, texty) {
      const rows = load();
      let n = 0;
      for (const text of texty) {
        const klic = normalizuj(text);
        if (rows.some((r) => r.autor === autor && r.kategorie === kategorie && r.klic === klic)) continue;
        rows.push({ id: id(), created_at: new Date().toISOString(), autor, kategorie, text, klic, pouzito_at: null });
        n++;
      }
      save(rows);
      return n;
    },
    async pridejObrazek(autor, obrazek, klic) {
      const rows = load();
      if (rows.some((r) => r.autor === autor && r.kategorie === "popis" && r.klic === klic)) return false;
      rows.push({ id: id(), created_at: new Date().toISOString(), autor, kategorie: "popis", obrazek, klic, pouzito_at: null });
      save(rows);
      return true;
    },
    async vylosuj(autor, kategorie, iPouzite = false) {
      const rows = load();
      const pool = rows.filter((r) => r.autor === autor && r.kategorie === kategorie && (iPouzite || !r.pouzito_at));
      if (!pool.length) return null;
      const r = pool[Math.floor(Math.random() * pool.length)];
      r.pouzito_at = new Date().toISOString();
      save(rows);
      return r;
    },
    async novaHra() {
      save(load().map((r) => ({ ...r, pouzito_at: null })));
    },
    async vsechno() {
      return load();
    },
    async smaz(rid) {
      save(load().filter((r) => r.id !== rid));
    },
  };
}

let api;
async function initApi() {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.99.3/+esm");
    api = supabaseApi(createClient(SUPABASE_URL, SUPABASE_ANON_KEY));
  } else {
    api = demoApi();
    document.getElementById("demo-banner").hidden = false;
  }
}

// ---------- Stránka: přidávání (odkaz pro kamarády) ----------

function stranka_pridat() {
  const gender = lsGet(LS_GENDER, null);
  if (!gender) return vyberGender();

  const jsemHolka = gender === "holka";
  const svet = jsemHolka ? "ženského" : "mužského";
  const hraji = jsemHolka ? "kluci" : "holky";
  const moje = lsGet(LS_MOJE, {});
  const tema = jsemHolka ? "holky" : "kluci";

  $app.replaceChildren(
    h(`
    <header class="hero tema-${tema}">
      <p class="eyebrow">Aktivity · holky vs. kluci</p>
      <h1>Přidej věci ze ${svet} světa</h1>
      <p class="lead">Všechno, co sem napíšeš, budou kreslit, předvádět a popisovat <strong>${hraji}</strong>.
      Čím víc typicky „${jsemHolka ? "holčičí" : "klukovské"}“, tím větší legrace.</p>
      <p class="kdo">Jsi ${jsemHolka ? "holka" : "kluk"} · <button class="link" id="zmenit">změnit</button></p>
    </header>

    <section class="karta">
      <h2><span class="dlazdice">${KATEGORIE.kresleni.ikona}</span>Kreslení</h2>
      <p class="hint">Můžeš jich vložit víc najednou – každé na nový řádek nebo oddělené čárkou.</p>
      <textarea id="t-kresleni" rows="4" placeholder="Co se bude kreslit…"></textarea>
      <div class="row"><button class="btn tema-${tema}" data-pridat="kresleni">Přidat ke kreslení</button>
      <span class="moje" id="m-kresleni"></span></div>
    </section>

    <section class="karta">
      <h2><span class="dlazdice">${KATEGORIE.pantomima.ikona}</span>Pantomima</h2>
      <p class="hint">Hodí se činnosti a situace. Víc najednou odděl novým řádkem nebo čárkou.</p>
      <textarea id="t-pantomima" rows="4" placeholder="Co se bude předvádět…"></textarea>
      <div class="row"><button class="btn tema-${tema}" data-pridat="pantomima">Přidat k pantomimě</button>
      <span class="moje" id="m-pantomima"></span></div>
    </section>

    <section class="karta">
      <h2><span class="dlazdice">${KATEGORIE.popis.ikona}</span>Obrázky k popisování</h2>
      <p class="hint">Hráči druhého týmu nejdřív musí poznat, co na obrázku je, a pak to popsat svým.
      Ideální jsou věci, které ${hraji} běžně nepoznají.</p>
      <label class="drop" id="drop">
        <input type="file" id="soubory" accept="image/*" multiple hidden>
        <span class="drop-ikona">${ic("foto")}</span>
        <span><strong>Vyber fotky</strong> z telefonu nebo počítače<br>
        <small>nebo je sem přetáhni, případně zkopíruj obrázek z internetu a vlož ho (Ctrl+V)</small></span>
      </label>
      <div class="vloz" id="vloz" contenteditable="true" aria-label="Sem vlož zkopírovaný obrázek"
        data-placeholder="Na mobilu: podrž prst tady a dej Vložit"></div>
      <div class="row"><span class="moje" id="m-popis"></span></div>
      <div class="nahled" id="nahled"></div>
    </section>

    <p class="footer-note">Ostatní příspěvky neuvidíš, ať je hra překvapení.</p>
    <p class="footer-note"><a href="#/prehled">${ic("graf")} Kolik už toho máme?</a></p>
  `)
  );

  const ukazMoje = () => {
    for (const k of Object.keys(KATEGORIE)) {
      const n = moje[k] || 0;
      document.getElementById("m-" + k).textContent = n ? `Ty jsi přidal${jsemHolka ? "a" : ""}: ${n}` : "";
    }
  };
  ukazMoje();
  const zapocti = (k, n) => {
    moje[k] = (moje[k] || 0) + n;
    lsSet(LS_MOJE, moje);
    ukazMoje();
  };

  document.getElementById("zmenit").onclick = () => {
    lsSet(LS_GENDER, null);
    stranka_pridat();
  };

  $app.querySelectorAll("[data-pridat]").forEach((btn) => {
    btn.onclick = async () => {
      const k = btn.dataset.pridat;
      const ta = document.getElementById("t-" + k);
      const videno = new Set();
      const texty = ta.value
        .split(/[\n,;]/)
        .map((s) => s.replace(/\s+/g, " ").trim().slice(0, 100))
        .filter((s) => s && !videno.has(normalizuj(s)) && videno.add(normalizuj(s)));
      if (!texty.length) return toast("Napiš aspoň jedno slovo");
      btn.disabled = true;
      try {
        const pridano = await api.pridejTexty(gender, k, texty);
        const dup = texty.length - pridano;
        ta.value = "";
        zapocti(k, pridano);
        toast(`Přidáno: ${pridano}` + (dup ? ` · ${dup}× už tam bylo, přeskočeno` : ""));
      } catch (e) {
        toast("Nepovedlo se uložit: " + e.message);
      } finally {
        btn.disabled = false;
      }
    };
  });

  // Obrázky: výběr souboru, přetažení, vložení ze schránky
  const nahled = document.getElementById("nahled");
  const nahraj = async (soubory) => {
    const obrazky = [...soubory].filter((f) => f.type.startsWith("image/"));
    if (!obrazky.length) return toast("Tohle není obrázek");
    let ok = 0;
    let dup = 0;
    for (const f of obrazky) {
      const box = h(`<div class="thumb nahravam"><span class="spinner"></span></div>`).firstChild;
      nahled.prepend(box);
      try {
        const [data, klic] = await Promise.all([zmensiObrazek(f), otisk(f)]);
        box.innerHTML = `<img src="${data}" alt="">`;
        if (await api.pridejObrazek(gender, data, klic)) {
          ok++;
          box.classList.remove("nahravam");
          box.insertAdjacentHTML("beforeend", `<span class="stav">${ic("check")}</span>`);
        } else {
          dup++;
          box.remove();
        }
      } catch (e) {
        box.remove();
        toast("Nepovedlo se nahrát: " + e.message);
      }
    }
    if (ok) zapocti("popis", ok);
    if (ok || dup) toast(`Nahráno: ${ok}` + (dup ? ` · ${dup}× už tam byl, přeskočeno` : ""));
    // Náhledy necháváme jen chvíli, ať tu nezůstávají na očích
    setTimeout(() => nahled.replaceChildren(), 6000);
  };

  const input = document.getElementById("soubory");
  input.onchange = () => {
    nahraj(input.files);
    input.value = "";
  };
  const drop = document.getElementById("drop");
  drop.ondragover = (e) => {
    e.preventDefault();
    drop.classList.add("nad");
  };
  drop.ondragleave = () => drop.classList.remove("nad");
  drop.ondrop = (e) => {
    e.preventDefault();
    drop.classList.remove("nad");
    nahraj(e.dataTransfer.files);
  };
  const vloz = document.getElementById("vloz");
  const onPaste = (e) => {
    const files = [...(e.clipboardData?.items || [])].filter((i) => i.kind === "file").map((i) => i.getAsFile());
    if (files.length) {
      e.preventDefault();
      nahraj(files);
    } else if (e.currentTarget === vloz) {
      e.preventDefault();
      toast("Ve schránce není obrázek. Zkopíruj obrázek (ne odkaz).");
    }
    vloz.innerHTML = "";
  };
  vloz.addEventListener("paste", onPaste);
  vloz.addEventListener("input", () => (vloz.innerHTML = ""));
  pasteHandler = (e) => {
    if (e.target.tagName !== "TEXTAREA" && e.target !== vloz) onPaste(e);
  };
}

let pasteHandler = null;
document.addEventListener("paste", (e) => pasteHandler?.(e));

function vyberGender() {
  $app.replaceChildren(
    h(`
    <header class="hero">
      <p class="eyebrow">Aktivity · holky vs. kluci</p>
      <h1>Kdo jsi?</h1>
      <p class="lead">Hrajeme Aktivity holky proti klukům. Holky budou kreslit, předvádět a popisovat věci z mužského světa,
      kluci z ženského. A ty slova a obrázky vymýšlíte vy!</p>
    </header>
    <div class="volba">
      <button class="velka tema-holky" data-g="holka"><span class="symbol">${ic("venus")}</span>Holka</button>
      <button class="velka tema-kluci" data-g="kluk"><span class="symbol">${ic("mars")}</span>Kluk</button>
    </div>
  `)
  );
  $app.querySelectorAll("[data-g]").forEach((b) => {
    b.onclick = () => {
      lsSet(LS_GENDER, b.dataset.g);
      stranka_pridat();
    };
  });
}

// ---------- Stránka: přehled počtů ----------

async function stranka_prehled() {
  $app.replaceChildren(
    h(`
    <header class="hero">
      <p class="eyebrow">Přehled</p>
      <h1>Kolik toho máme?</h1>
      <p class="lead">Jen počty, obsah zůstává tajný. Kde je málo, tam popožeň.</p>
    </header>
    <div id="pocty" class="pocty"><p class="hint">Načítám…</p></div>
    <nav class="nav">
      ${UKAZAT_HRU ? `<a class="btn" href="#/hra">${ic("kostky")} Jdeme hrát</a>` : ""}
      <a class="btn sekundarni" href="#/">${ic("plus")} Přidat slova</a>
    </nav>
    <p class="nenapadne"><a href="#/sprava">správa obsahu</a></p>
  `)
  );
  try {
    const rows = await api.pocty();
    const get = (autor, k) => rows.find((r) => r.autor === autor && r.kategorie === k) || { celkem: 0, zbyva: 0 };
    const sloupec = (autor) => {
      const holky = autor === "holka";
      return `
        <div class="pocet-karta tema-${holky ? "holky" : "kluci"}">
          <h2>${ic(holky ? "venus" : "mars")} ${holky ? "Holky přidaly" : "Kluci přidali"}</h2>
          <p class="hint">hrají ${holky ? "kluci" : "holky"}</p>
          ${Object.entries(KATEGORIE)
            .map(([k, kat]) => {
              const { celkem, zbyva } = get(autor, k);
              const malo = celkem < 10 ? " malo" : "";
              return `<div class="pocet-radek${malo}">
                <span>${kat.ikona} ${kat.nazev}</span>
                <strong>${celkem}</strong>
                ${zbyva < celkem ? `<small>${zbyva} nepoužitých</small>` : ""}
              </div>`;
            })
            .join("")}
        </div>`;
    };
    document.getElementById("pocty").replaceChildren(h(sloupec("holka") + sloupec("kluk")));
  } catch (e) {
    document.getElementById("pocty").innerHTML = `<p class="chyba">Nepovedlo se načíst: ${esc(e.message)}</p>`;
  }
}

// ---------- Stránka: hra ----------

function stranka_hra() {
  let tym = lsGet(LS_TYM, "holky");
  let kategorie = null;
  let polozka = null;

  const render = () => {
    $app.replaceChildren(
      h(`
      <header class="hero kompakt">
        <p class="eyebrow">Hra</p>
        <h1>Kdo je na tahu?</h1>
      </header>
      <div class="volba">
        ${Object.entries(TYM)
          .map(
            ([k, t]) =>
              `<button class="velka tema-${k}${tym === k ? " aktivni" : ""}" data-tym="${k}"><span class="symbol">${t.ikona}</span>${t.nazev}</button>`
          )
          .join("")}
      </div>
      <h2 class="nadpis-sekce">Na jaké políčko jste stoupli?</h2>
      <div class="policka">
        ${Object.entries(KATEGORIE)
          .map(([k, kat]) => `<button class="policko" data-kat="${k}"><span class="dlazdice">${kat.ikona}</span>${kat.nazev}</button>`)
          .join("")}
      </div>
      <nav class="nav">
        <a class="btn sekundarni" href="#/prehled">${ic("graf")} Přehled</a>
        <button class="btn sekundarni" id="nova-hra">${ic("znovu")} Nová hra</button>
      </nav>
    `)
    );
    $app.querySelectorAll("[data-tym]").forEach((b) => {
      b.onclick = () => {
        tym = b.dataset.tym;
        lsSet(LS_TYM, tym);
        render();
      };
    });
    $app.querySelectorAll("[data-kat]").forEach((b) => {
      b.onclick = () => {
        kategorie = b.dataset.kat;
        losuj();
      };
    });
    document.getElementById("nova-hra").onclick = async () => {
      if (!confirm("Začít novou hru? Všechna už použitá slova a obrázky se vrátí do hry.")) return;
      try {
        await api.novaHra();
        toast("Nová hra – všechno je zase ve hře");
      } catch (e) {
        toast("Nepovedlo se: " + e.message);
      }
    };
  };

  const losuj = async (iPouzite = false) => {
    $app.replaceChildren(h(`<div class="losovani"><div class="kostka">${ic("kostky")}</div><p>Losuju…</p></div>`));
    try {
      polozka = await api.vylosuj(TYM[tym].autor, kategorie, iPouzite);
    } catch (e) {
      toast("Nepovedlo se vylosovat: " + e.message);
      return render();
    }
    zobrazKartu();
  };

  const zobrazKartu = () => {
    const kat = KATEGORIE[kategorie];
    const t = TYM[tym];
    if (!polozka) {
      $app.replaceChildren(
        h(`
        <div class="karta prazdno">
          <h2>Došlo to!</h2>
          <p>Pro tým <strong>${t.nazev}</strong> už tu nejsou ${kat.co}.
          Ať ${t.autor === "holka" ? "holky" : "kluci"} přidají další, nebo vylosujte z už použitých.</p>
          <div class="row">
            <button class="btn" id="i-pouzite">Losovat i z použitých</button>
            <button class="btn sekundarni" id="zpet">Zpět</button>
          </div>
        </div>
      `)
      );
      document.getElementById("i-pouzite").onclick = () => losuj(true);
      document.getElementById("zpet").onclick = render;
      return;
    }

    const obsah =
      kategorie === "popis"
        ? `<img class="obrazek-hra" src="${polozka.obrazek}" alt="Obrázek k popisu">`
        : `<p class="slovo">${esc(polozka.text)}</p>`;
    const ukol = {
      kresleni: "Nakresli to svému týmu. Žádná písmena ani čísla!",
      pantomima: "Předveď to svému týmu beze slov.",
      popis: "Nejdřív poznej, co na obrázku je, a pak to popiš svému týmu, aniž bys to jmenoval/a.",
    }[kategorie];

    $app.replaceChildren(
      h(`
      <div class="tah tema-${tym}">
        <p class="chip">${t.ikona} ${t.nazev} <span class="tecka"></span> ${kat.ikona} ${kat.nazev}</p>
        <button class="zakryto" id="karta">
          <span class="zakryto-ikona">${ic("skryto")}</span>
          <strong>Ukaž telefon jen hráči, který je na řadě</strong>
          <span>Klepni pro odkrytí</span>
        </button>
        <div class="odkryto" id="odkryto" hidden>
          ${obsah}
          <p class="ukol">${ukol}</p>
        </div>
        <div class="row stred">
          <button class="btn" id="hotovo">${ic("check")} Hotovo</button>
          <button class="btn sekundarni" id="dalsi">${ic("dalsi")} Další</button>
        </div>
        <p class="pravidlo">Pravidlo: <strong>„Další“</strong> smíš zmáčknout jen tehdy, když hráč nahlas a zřetelně řekne
        <strong>„Další!“</strong> Jinak platí, co padlo.</p>
      </div>
    `)
    );
    document.getElementById("karta").onclick = (e) => {
      e.currentTarget.hidden = true;
      document.getElementById("odkryto").hidden = false;
    };
    document.getElementById("hotovo").onclick = render;
    document.getElementById("dalsi").onclick = () => losuj();
  };

  render();
}

// ---------- Stránka: správa (skrytý obsah) ----------

function stranka_sprava() {
  $app.replaceChildren(
    h(`
    <div class="karta varovani">
      <h2>${ic("pozor")} Pozor, spoilery!</h2>
      <p>Tady uvidíš všechna slova a obrázky, které ostatní přidali. Pokud hraješ, možná se nechceš dívat.</p>
      <div class="row">
        <button class="btn" id="ukaz">Ukázat obsah</button>
        <a class="btn sekundarni" href="#/prehled">Zpět</a>
      </div>
    </div>
  `)
  );
  document.getElementById("ukaz").onclick = nactiSpravu;
}

async function nactiSpravu() {
  $app.replaceChildren(h(`<p class="hint">Načítám…</p>`));
  let rows;
  try {
    rows = await api.vsechno();
  } catch (e) {
    $app.innerHTML = `<p class="chyba">Nepovedlo se načíst: ${esc(e.message)}</p>`;
    return;
  }
  const sekce = [];
  for (const autor of ["holka", "kluk"]) {
    for (const [k, kat] of Object.entries(KATEGORIE)) {
      const polozky = rows.filter((r) => r.autor === autor && r.kategorie === k);
      sekce.push(`
        <section class="karta">
          <h2>${autor === "holka" ? "Od holek" : "Od kluků"} · ${kat.nazev} <small>(${polozky.length})</small></h2>
          <ul class="seznam${k === "popis" ? " obrazky" : ""}">
            ${polozky
              .map(
                (r) => `<li class="${r.pouzito_at ? "pouzito" : ""}">
                  ${k === "popis" ? `<img src="${r.obrazek}" alt="" loading="lazy">` : `<span>${esc(r.text)}</span>`}
                  <button class="smazat" data-id="${r.id}" title="Smazat" aria-label="Smazat">${ic("kos")}</button>
                </li>`
              )
              .join("") || `<li class="hint">Nic tu není.</li>`}
          </ul>
        </section>`);
    }
  }
  $app.replaceChildren(
    h(`
    <header class="hero kompakt">
      <p class="eyebrow">Správa obsahu</p>
      <h1>Všechno, co je ve hře</h1>
      <p class="hint">Přeškrtnuté už ve hře padlo.</p>
    </header>
    ${sekce.join("")}
    <nav class="nav"><a class="btn sekundarni" href="#/prehled">Zpět na přehled</a></nav>
  `)
  );
  $app.querySelectorAll(".smazat").forEach((b) => {
    b.onclick = async () => {
      if (!confirm("Opravdu smazat?")) return;
      try {
        await api.smaz(b.dataset.id);
        b.closest("li").remove();
      } catch (e) {
        toast("Nepovedlo se smazat: " + e.message);
      }
    };
  });
}

// ---------- Router ----------

const ROUTY = {
  "": stranka_pridat,
  prehled: stranka_prehled,
  hra: stranka_hra,
  sprava: stranka_sprava,
};

function route() {
  pasteHandler = null;
  document.getElementById("toast").classList.remove("show");
  const cesta = location.hash.replace(/^#\/?/, "");
  (ROUTY[cesta] || stranka_pridat)();
  window.scrollTo(0, 0);
}

await initApi();
window.addEventListener("hashchange", route);
route();
