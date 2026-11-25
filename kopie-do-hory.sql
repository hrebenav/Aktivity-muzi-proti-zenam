-- Zkopíruje všechna slova a obrázky první party do party Hory jako nehraná.
-- První parta zůstane beze změny (včetně toho, co už u ní padlo).
-- Slova, která si Hory přidají, zůstanou jen jim.
-- Zkopíruj do Supabase → SQL Editor → Run. Obsah se neukáže, jen počty.
-- Jde spustit opakovaně: co už v Horách je, se znovu nepřidá.

insert into public.parta (nazev, kod)
values ('Hory', 'hory')
on conflict do nothing;

with prvni as (
  select id from public.parta order by created_at limit 1
),
hory as (
  select id from public.parta where kod = 'hory'
),
nove as (
  insert into public.polozky (parta_id, autor, kategorie, text, obrazek, klic)
  select (select id from hory), p.autor, p.kategorie, p.text, p.obrazek, p.klic
  from public.polozky p
  where p.parta_id = (select id from prvni)
    and (select id from prvni) <> (select id from hory)
  on conflict do nothing
  returning 1
)
select (select count(*) from nove) as zkopirovano_do_hor,
       (select count(*) from public.polozky where parta_id = (select id from hory))
         + (select count(*) from nove) as hory_celkem;
