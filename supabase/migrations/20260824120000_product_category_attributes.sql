-- Category-specific product attributes (e.g. skin type for cosmetics, flavor for
-- chocolate), stored as JSONB since each category has a different set of fields and
-- the set of categories/fields is expected to keep evolving. Defaulted to '{}' rather
-- than nullable so admin code can always index into it without a null check.
alter table products
  add column attributes jsonb not null default '{}'::jsonb;
