-- 0024_instructor_portal.sql
-- Vinculación instructor ↔ curso + dashboard de revenue + queue de Q&A.

create table if not exists edu.course_instructors (
  course_id uuid not null references edu.courses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'instructor' check (role in ('instructor','co-instructor','assistant')),
  revenue_share_pct numeric(5,2) not null default 0 check (revenue_share_pct >= 0 and revenue_share_pct <= 100),
  added_at timestamptz not null default now(),
  primary key (course_id, user_id)
);

create index if not exists course_instructors_user_idx on edu.course_instructors (user_id);

-- View: revenue por instructor (suma de orders.subtotal en cursos asignados)
create or replace view edu.instructor_revenue_summary as
select
  ci.user_id as instructor_id,
  ci.course_id,
  p.name as course_name,
  ci.revenue_share_pct,
  count(distinct e.user_id) as students,
  coalesce(sum(oi.unit_price_cents * oi.qty), 0) as gross_cents,
  coalesce(sum(oi.unit_price_cents * oi.qty), 0) * ci.revenue_share_pct / 100 as share_cents
from edu.course_instructors ci
join edu.courses c on c.id = ci.course_id
join shop.products p on p.id = c.product_id
left join edu.enrollments e on e.course_id = ci.course_id
left join shop.order_items oi on oi.product_id = p.id
left join shop.orders o on o.id = oi.order_id and o.status = 'paid'
group by ci.user_id, ci.course_id, p.name, ci.revenue_share_pct;

-- RLS
alter table edu.course_instructors enable row level security;
drop policy if exists "instructors read own" on edu.course_instructors;
create policy "instructors read own" on edu.course_instructors
  for select using (auth.uid() = user_id);
-- inserts via admin only
