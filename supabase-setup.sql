-- Aktivity: muži proti ženám – nastavení databáze
-- Celý soubor zkopíruj do Supabase → SQL Editor → Run.
-- Skript jde spustit opakovaně (nic nesmaže).

create table if not exists public.polozky (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  autor text not null check (autor in ('holka', 'kluk')),            -- kdo to přidal (hraje to opačný tým)
  kategorie text not null check (kategorie in ('kresleni', 'pantomima', 'popis')),
  text text check (char_length(text) <= 100),                       -- slovo pro kreslení / pantomimu
  obrazek text check (char_length(obrazek) <= 1500000),             -- zmenšený obrázek (data URL) pro popis
  klic text not null,                                               -- normalizovaný text / otisk obrázku kvůli duplicitám
  pouzito_at timestamptz,                                           -- kdy padlo ve hře (null = ještě nepoužito)
  check ((kategorie = 'popis') = (obrazek is not null)),
  check ((kategorie = 'popis') = (text is null))
);

-- Duplicity: stejné slovo / obrázek může být v jedné kategorii od jednoho týmu jen jednou
create unique index if not exists polozky_bez_duplicit on public.polozky (autor, kategorie, klic);

alter table public.polozky enable row level security;

drop policy if exists "cteni" on public.polozky;
drop policy if exists "pridavani" on public.polozky;
drop policy if exists "oznaceni_pouziti" on public.polozky;
drop policy if exists "mazani" on public.polozky;

create policy "cteni" on public.polozky for select to anon using (true);
create policy "pridavani" on public.polozky for insert to anon with check (pouzito_at is null);
create policy "oznaceni_pouziti" on public.polozky for update to anon using (true) with check (true);
create policy "mazani" on public.polozky for delete to anon using (true);

-- Práva pro veřejnou stránku. Upravovat jde jen sloupec „pouzito_at“ (slova samotná nikdo přepsat nemůže)
grant usage on schema public to anon;
grant select, insert, delete on public.polozky to anon;
revoke update on public.polozky from anon;
grant update (pouzito_at) on public.polozky to anon;

-- Počty pro přehled (bez prozrazení obsahu)
create or replace function public.pocty()
returns table (autor text, kategorie text, celkem bigint, zbyva bigint)
language sql stable
as $$
  select p.autor, p.kategorie, count(*), count(*) filter (where p.pouzito_at is null)
  from public.polozky p
  group by p.autor, p.kategorie
$$;

-- Náhodně vylosuje jednu položku a rovnou ji označí jako použitou
create or replace function public.vylosuj(p_autor text, p_kategorie text, p_i_pouzite boolean default false)
returns setof public.polozky
language sql volatile
as $$
  update public.polozky
  set pouzito_at = now()
  where id = (
    select id from public.polozky
    where autor = p_autor
      and kategorie = p_kategorie
      and (p_i_pouzite or pouzito_at is null)
    order by random()
    limit 1
  )
  returning *
$$;

-- Nová hra: všechno zase nepoužité
create or replace function public.nova_hra()
returns void
language sql volatile
as $$
  update public.polozky set pouzito_at = null where pouzito_at is not null
$$;

grant execute on function public.pocty() to anon;
grant execute on function public.vylosuj(text, text, boolean) to anon;
grant execute on function public.nova_hra() to anon;
