-- Rich content shown on the customer product page (cosmetics.lk-style
-- Benefits/How to Use/Ingredients sections). Plain text, one bullet/step
-- per line, split client-side rather than a JSON array or rich-text editor
-- so the admin form stays a plain textarea per field.
alter table products add column brand text;
alter table products add column benefits text;
alter table products add column how_to_use text;
alter table products add column ingredients text;

-- SKU already existed on product_variants but was never exposed in the
-- admin form. Adding barcode alongside it while closing that gap.
alter table product_variants add column barcode text;
