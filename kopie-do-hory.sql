-- Zkopíruje všechna slova a obrázky první party do party „Kačka hory“ jako nehraná.
-- První parta zůstane beze změny (včetně toho, co už u ní padlo).
-- Slova, která si Kačka hory přidají, zůstanou jen jim.
-- Navíc smaže omylem založenou partu „Hory“ (kód hory), pokud v ní nic vlastního není.
-- Zkopíruj do Supabase → SQL Editor → Run. Obsah se neukáže, jen počty.
-- Jde spustit opakovaně: co už v cílové partě je, se znovu nepřidá.

delete from public.parta h
where h.kod = 'hory'
  and exists (select 1 from public.parta where kod = 'kacka-hory')
  and not exists (
    select 1 from public.polozky p
    where p.parta_id = h.id
      and not exists (
        select 1 from public.polozky q
        where q.parta_id = (select id from public.parta order by created_at limit 1)
          and q.autor = p.autor and q.kategorie = p.kategorie and q.klic = p.klic
      )
  );

with prvni as (
  select id from public.parta order by created_at limit 1
),
cil as (
  select id from public.parta where kod = 'kacka-hory'
),
nove as (
  insert into public.polozky (parta_id, autor, kategorie, text, obrazek, klic)
  select (select id from cil), p.autor, p.kategorie, p.text, p.obrazek, p.klic
  from public.polozky p
  where p.parta_id = (select id from prvni)
    and (select id from prvni) <> (select id from cil)
  on conflict do nothing
  returning 1
)
select (select count(*) from nove) as zkopirovano,
       (select count(*) from public.polozky where parta_id = (select id from cil))
         + (select count(*) from nove) as kacka_hory_celkem,
       (select count(*) from public.parta where kod = 'hory') as omylem_zalozena_hory;
