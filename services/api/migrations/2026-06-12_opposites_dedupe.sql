-- OPTIONAL cleanup — remove duplicate opposite-pairs (owner review before run).
--
-- Direct query (2026-06-12) showed opposites_items has the original L1–L6 seed
-- PLUS a later "deduped" authoring pass added on top, so several pairs appear
-- twice (reversed) in the same lesson. This deletes the redundant copies,
-- keeping the lower (canonical) sort_order of each pair.
--
-- Rows deleted (verified duplicates of an earlier row in the same lesson):
--   L2 sort 6,7,8  → dup of 2,3,1  (ivanu / ivaḷu / ivaru pairs)
--   L3 sort 6,7,8  → dup of 1,3,4  (bēku / kaḍime / māḍi pairs)
--   L4 sort 6,7    → dup of 1,2    (illi / idu pairs)
--   L5 sort 6,7,8  → dup of 1,2,4  (bā / koḍu / kuḷituko pairs)
--
-- NOTE — L5 has a near-duplicate sleep/wake pair too: sort 3 (malagu/eddu) and
-- sort 9 (eḷu/malagu). Both kept by default. To collapse them, keep sort 9
-- (eḷu IS the L5c lesson word; eddu is not) and delete sort 3 — uncomment below.
--
-- WARNING: this also removes any opposites_progress rows that reference the
-- deleted items (via FK). Fine for the duplicates (they were never the
-- canonical pair), but be aware if real attempts exist.

delete from public.opposites_items oi
using public.lessons l
where oi.lesson_id = l.id
  and (l.lesson_no, oi.sort_order) in (
    (2,6),(2,7),(2,8),
    (3,6),(3,7),(3,8),
    (4,6),(4,7),
    (5,6),(5,7),(5,8)
  );

-- Optional: collapse the L5 sleep/wake near-dup (keep eḷu/malagu, drop malagu/eddu)
-- delete from public.opposites_items oi using public.lessons l
-- where oi.lesson_id = l.id and l.lesson_no = 5 and oi.sort_order = 3;
