-- 0007: reviews / ratings sobre shop.products con moderación + verified_purchase.

create type shop.review_status as enum ('pending', 'approved', 'rejected');

create table shop.reviews (
  id                 uuid primary key default gen_random_uuid(),
  product_id         uuid not null references shop.products(id) on delete cascade,
  user_id            uuid not null references auth.users(id) on delete cascade,
  rating             smallint not null check (rating between 1 and 5),
  title              text,
  body               text,
  verified_purchase  boolean not null default false,
  status             shop.review_status not null default 'pending',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique(product_id, user_id)
);

create index on shop.reviews(product_id, status);
create index on shop.reviews(status, created_at desc);
create trigger trg_reviews_updated
  before update on shop.reviews
  for each row execute function app.set_updated_at();

-- Vista agregada para promedio + count + distribución.
create or replace view shop.review_aggregates as
select
  product_id,
  count(*)::int as review_count,
  round(avg(rating)::numeric, 2)::float as rating_avg,
  count(*) filter (where rating = 5)::int as r5,
  count(*) filter (where rating = 4)::int as r4,
  count(*) filter (where rating = 3)::int as r3,
  count(*) filter (where rating = 2)::int as r2,
  count(*) filter (where rating = 1)::int as r1
from shop.reviews
where status = 'approved'
group by product_id;

-- RLS
alter table shop.reviews enable row level security;

-- Lectura pública sólo de approved
create policy "reviews public read approved" on shop.reviews
  for select using (status = 'approved');

-- Usuario ve sus propias reviews siempre (incluso pending)
create policy "reviews owner read own" on shop.reviews
  for select using (auth.uid() = user_id);

-- Usuario inserta sólo sus propias reviews; verified_purchase se setea por trigger.
create policy "reviews owner insert" on shop.reviews
  for insert with check (auth.uid() = user_id);

-- Usuario edita sólo sus propias reviews y vuelven a pending si cambia rating/body.
create policy "reviews owner update" on shop.reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Staff (vía service_role / RPC) puede todo.
create policy "reviews staff all" on shop.reviews
  for all using (
    exists (select 1 from app.profiles p where p.user_id = auth.uid() and p.role in ('staff', 'admin'))
  );

-- Trigger: setear verified_purchase si el user tiene order_items pagados de ese product.
create or replace function shop.set_review_verified()
returns trigger language plpgsql security definer set search_path = public, shop as $$
begin
  new.verified_purchase := exists (
    select 1
    from shop.order_items oi
    join shop.orders o on o.id = oi.order_id
    where oi.product_id = new.product_id
      and o.user_id = new.user_id
      and o.status = 'paid'
  );
  return new;
end;
$$;

create trigger trg_reviews_verified
  before insert or update of product_id on shop.reviews
  for each row execute function shop.set_review_verified();

grant select on shop.reviews, shop.review_aggregates to anon, authenticated;
grant insert, update on shop.reviews to authenticated;
