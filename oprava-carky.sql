-- Rozdělí slova zadaná s čárkou/středníkem na samostatná slova (duplicity přeskočí).
-- Zkopíruj do Supabase → SQL Editor → Run. Obsah slov se neukáže, jen počty.
with smazane as (
  delete from public.polozky
  where kategorie <> 'popis' and text ~ '[,;]'
  returning autor, kategorie, text
),
casti as (
  select s.autor, s.kategorie, btrim(regexp_replace(c, '\s+', ' ', 'g')) as text
  from smazane s, regexp_split_to_table(s.text, '[,;]') as c
),
nove as (
  insert into public.polozky (autor, kategorie, text, klic)
  select distinct on (autor, kategorie, klic) autor, kategorie, text, klic
  from (
    select autor, kategorie, text,
      btrim(regexp_replace(regexp_replace(
        translate(lower(text), 'áäčďéěëíňóöřšťúůüýž', 'aacdeeeinoorstuuuyz'),
        '[.!?:"''„“”]+', '', 'g'), '\s+', ' ', 'g')) as klic
    from casti
    where text <> ''
  ) x
  on conflict do nothing
  returning 1
)
select (select count(*) from smazane) as rozdeleno_zaznamu,
       (select count(*) from nove) as pridano_slov;
