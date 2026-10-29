-- Vennti intake: one table for every application, from either front door.
--
-- SHAPE
--   signups          one row per person. Both the vennti.co form and the Google
--                    Form write here. Fields only one form asks are null until
--                    the questions converge.
--   dating_profiles  versioned profile cards, hanging off signups.
--
-- REPEAT APPLICATIONS
--   Not new rows. The application is six identity facts that do not change
--   between submissions, so a second submission carries no new answer. What it
--   carries is interest, and that is recorded as application_count plus an
--   applied_at array of dates.
--   The one field that genuinely accumulates is events_interested: Josh Staggs
--   applied three times and picked different events each time (nothing in
--   September, Bowling Night on Oct 14, Taco Tuesday on Oct 27). So that field
--   is UNIONED on a repeat application, never replaced.
--   What you give up: the raw column holds only the most recent submission, so
--   you can see which questions the form asked that time but not earlier times.
--   Accepted deliberately; user logins will supersede this whole mechanism.
--
-- THREE AXES, NOT ONE STATUS
--   The sheet records the same fact in several columns that can disagree:
--   "Status = scheduled" and "Video Call Scheduled = yes" are one fact stored
--   twice. They are really three independent things:
--     stage         ordered, moves one way: applied -> contacted -> scheduled
--                   -> interviewed -> profiled
--     availability  a state, not a stage: active / taken / paused /
--                   not_considering / not_answering
--     attendance    per event, and does not belong on the person row at all.
--                   The sheet's "coming" and "Attended first event" are this.
--                   Waits for an events table.
--   Someone can be interviewed AND taken, or profiled AND paused. One column
--   cannot hold both.
--
-- THE WRITE PATH
--   public.record_signup() is the only way an application enters the table. The
--   website server function and the sheet sync both call it. It has no
--   parameters for stage, availability, notes or the timestamps, so neither
--   caller can overwrite a hand-typed note. That is deliberate: Josh's third
--   submission arrived with the sheet's Status column blank even though his
--   first two said "met", and a sync that wrote tracking columns would have
--   erased it.
--
-- DEPLOY ORDER
--   1. this migration. waitlist_applications is read, not touched, still works.
--   2. repoint src/lib/waitlist.functions.ts to call record_signup() for the
--      insert and select from signups for the list; regenerate
--      src/integrations/supabase/types.ts.
--   3. later, separately, drop waitlist_applications.

create type public.signup_source as enum ('website', 'google_form');

-- ----------------------------------------------------------------- signups

create table public.signups (
  id                uuid primary key default gen_random_uuid(),

  -- respondent-owned. record_signup() owns these; nothing else should write them.
  full_name         text not null,
  email             text,
  email_key         text generated always as (nullif(lower(btrim(email)), '')) stored,
  phone             text,
  age               integer,
  gender            text,
  city              text,            -- website form only, for now
  pronouns          text,            -- website form only, for now
  instagram         text,            -- website form only, for now
  linkedin          text,            -- website form only, for now
  screening_choice  text,            -- google form only, for now; wording has
                                     -- changed over time so stored verbatim
  events_interested text[] not null default '{}',

  -- how many times and when
  application_count integer not null default 1,
  applied_at        timestamptz[] not null default '{}',
  first_source      public.signup_source not null,
  last_source       public.signup_source not null,
  first_applied_at  timestamptz,
  last_applied_at   timestamptz,

  -- set when an application arrives with no email and so cannot be keyed;
  -- two such rows might be one human and only a person can tell
  needs_identity_review boolean not null default false,

  -- matchmaker-owned. record_signup() cannot reach any of these.
  stage           text not null default 'applied'
                  check (stage in ('applied','contacted','scheduled','interviewed','profiled')),
  availability    text not null default 'active'
                  check (availability in ('active','taken','paused','not_considering','not_answering')),
  interviewed_at  timestamptz,
  profile_sent_at timestamptz,
  notes           text,

  -- the most recent submission, verbatim. Lets you tell "never asked" from
  -- "asked and skipped" for the fields that are null.
  raw             jsonb not null default '{}'::jsonb,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint signups_age_sane check (age is null or age between 18 and 120),
  constraint signups_count_positive check (application_count >= 1)
);

-- One person per email address, case and whitespace insensitive. email_key is
-- NULL with no email, and Postgres permits many NULLs in a unique index, so
-- unkeyable people each get a row flagged for review.
create unique index signups_email_key_uniq on public.signups (email_key);

create index signups_name_lower_idx on public.signups ((lower(btrim(full_name))));
create index signups_stage_idx        on public.signups (stage);
create index signups_availability_idx on public.signups (availability);
create index signups_source_idx       on public.signups (last_source);
create index signups_review_idx       on public.signups (needs_identity_review) where needs_identity_review;
create index signups_events_idx       on public.signups using gin (events_interested);

create or replace function public.touch_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger signups_touch_updated_at
  before update on public.signups
  for each row execute function public.touch_updated_at();

-- -------------------------------------------------------- record_signup()

create or replace function public.record_signup(
  p_source           public.signup_source,
  p_full_name        text,
  p_email            text,
  p_submitted_at     timestamptz default now(),
  p_phone            text default null,
  p_age              integer default null,
  p_gender           text default null,
  p_city             text default null,
  p_pronouns         text default null,
  p_instagram        text default null,
  p_linkedin         text default null,
  p_screening_choice text default null,
  p_events           text[] default '{}',
  p_raw              jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  k         text := nullif(lower(btrim(p_email)), '');
  nm        text := coalesce(nullif(btrim(p_full_name), ''), '(no name given)');
  existing  public.signups;
  fresh     boolean;
begin
  if k is null then
    -- No email, no key. Own row, flagged. Does not increment anyone's count.
    insert into public.signups (
      full_name, email, phone, age, gender, city, pronouns, instagram, linkedin,
      screening_choice, events_interested, application_count, applied_at,
      first_source, last_source, first_applied_at, last_applied_at,
      needs_identity_review, raw
    ) values (
      nm, p_email, p_phone, p_age, p_gender, p_city, p_pronouns, p_instagram,
      p_linkedin, p_screening_choice, coalesce(p_events, '{}'), 1,
      case when p_submitted_at is null then '{}'::timestamptz[] else array[p_submitted_at] end,
      p_source, p_source, p_submitted_at, p_submitted_at, true, coalesce(p_raw, '{}'::jsonb)
    )
    returning * into existing;
    return existing.id;
  end if;

  select * into existing from public.signups where email_key = k;

  if not found then
    insert into public.signups (
      full_name, email, phone, age, gender, city, pronouns, instagram, linkedin,
      screening_choice, events_interested, application_count, applied_at,
      first_source, last_source, first_applied_at, last_applied_at, raw
    ) values (
      nm, p_email, p_phone, p_age, p_gender, p_city, p_pronouns, p_instagram,
      p_linkedin, p_screening_choice, coalesce(p_events, '{}'), 1,
      case when p_submitted_at is null then '{}'::timestamptz[] else array[p_submitted_at] end,
      p_source, p_source, p_submitted_at, p_submitted_at, coalesce(p_raw, '{}'::jsonb)
    )
    returning * into existing;
    return existing.id;
  end if;

  -- Is this a genuinely new application, or a daily sync re-reading a row it has
  -- already seen? The form's own timestamp decides. A re-read must not inflate
  -- application_count, which is what makes the sync safe to run hourly.
  fresh := p_submitted_at is not null
           and not (p_submitted_at = any (existing.applied_at));

  update public.signups set
    -- coalesce throughout: a later application that leaves a field blank never
    -- erases a value already known. The cost is that a field cannot be cleared
    -- by resubmitting it empty, which is a deliberate human edit anyway.
    full_name         = coalesce(nullif(btrim(p_full_name), ''), full_name),
    phone             = coalesce(p_phone,            phone),
    age               = coalesce(p_age,              age),
    gender            = coalesce(p_gender,           gender),
    city              = coalesce(p_city,             city),
    pronouns          = coalesce(p_pronouns,         pronouns),
    instagram         = coalesce(p_instagram,        instagram),
    linkedin          = coalesce(p_linkedin,         linkedin),
    screening_choice  = coalesce(p_screening_choice, screening_choice),

    -- UNIONED, not replaced. This is the field that accumulates.
    events_interested = (
      select coalesce(array_agg(distinct e order by e), '{}')
      from unnest(events_interested || coalesce(p_events, '{}')) e
      where e is not null and btrim(e) <> ''
    ),

    last_source       = p_source,
    applied_at        = case when fresh then applied_at || p_submitted_at else applied_at end,
    application_count = case when fresh then application_count + 1 else application_count end,
    first_applied_at  = least(first_applied_at, p_submitted_at),
    last_applied_at   = greatest(last_applied_at, p_submitted_at),
    -- holds the most recent NON-EMPTY submission. A caller that passes no raw
    -- payload must not wipe the one already stored.
    raw               = case when coalesce(p_raw, '{}'::jsonb) <> '{}'::jsonb
                             then p_raw else raw end
    -- stage, availability, interviewed_at, profile_sent_at and notes are ABSENT
    -- ON PURPOSE. Do not add them.
  where id = existing.id;

  return existing.id;
end;
$$;

comment on function public.record_signup is
  'The only write path for applications. Upserts a person on normalized email, unions event interest, counts and dates repeat applications, and is a no-op on a re-read of an already-seen submission. Cannot write stage, availability or notes.';

-- -------------------------------------------------------- dating_profiles
--
-- Deliberately not `profiles`: in Supabase apps that name almost always means
-- the signed-in user's own account record.
--
-- Versioned, because every card this month was revised after the client read it.
-- Yagna rewrote hers wholesale, Tim asked for three edits and the corrected card
-- was never re-sent, Sam asked for three more. A single mutable row loses the
-- text the person actually approved, which is the version that matters when you
-- put it in front of a room.

create table public.dating_profiles (
  id             uuid primary key default gen_random_uuid(),
  signup_id      uuid not null references public.signups (id) on delete cascade,

  version        integer not null default 1,
  is_current     boolean not null default true,

  display_name   text not null,          -- first name only; surnames come off
  age            integer,
  occupation     text,
  ready_for      text,
  kids           text,
  values_text    text,
  friends_say    text,
  loves          text,
  not_for        text,
  vibe           text,

  photo_path     text,                   -- object path in waitlist-uploads;
                                         -- serve via signed URL, never public

  client_approved    boolean not null default false,
  client_approved_at timestamptz,
  approval_note      text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint dating_profiles_version_positive check (version >= 1),
  constraint dating_profiles_approval_consistent
    check (client_approved = false or client_approved_at is not null)
);

create unique index dating_profiles_one_current
  on public.dating_profiles (signup_id) where is_current;
create unique index dating_profiles_signup_version
  on public.dating_profiles (signup_id, version);

create trigger dating_profiles_touch_updated_at
  before update on public.dating_profiles
  for each row execute function public.touch_updated_at();

-- Inserting a new current version demotes the previous one and numbers itself,
-- so the app can insert a card without juggling flags in a transaction.
create or replace function public.supersede_dating_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.version is null or new.version = 1 then
    select coalesce(max(version), 0) + 1 into new.version
    from public.dating_profiles where signup_id = new.signup_id;
  end if;

  if new.is_current then
    update public.dating_profiles set is_current = false
      where signup_id = new.signup_id and is_current;
  end if;

  return new;
end;
$$;

create trigger dating_profiles_supersede
  before insert on public.dating_profiles
  for each row execute function public.supersede_dating_profile();

-- ------------------------------------------------------------------- RLS

alter table public.signups         enable row level security;
alter table public.dating_profiles enable row level security;

create policy "signups_admin_all" on public.signups
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "dating_profiles_admin_all" on public.dating_profiles
  for all using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

revoke all on public.signups         from anon;
revoke all on public.dating_profiles from anon;
revoke all on function public.record_signup(
  public.signup_source, text, text, timestamptz, text, integer, text, text, text,
  text, text, text, text[], jsonb) from anon;

-- ------------------------------------------------------------- convenience

create or replace view public.signups_overview as
select
  s.id, s.full_name, s.email, s.phone, s.age, s.gender,
  s.stage, s.availability,
  s.application_count, s.first_applied_at, s.last_applied_at,
  s.first_source, s.last_source,
  s.events_interested,
  s.needs_identity_review,
  (dp.id is not null) as has_profile,
  dp.version          as profile_version,
  dp.client_approved  as profile_approved
from public.signups s
left join public.dating_profiles dp
  on dp.signup_id = s.id and dp.is_current;

-- --------------------------------------------- backfill from the website form
--
-- Through record_signup(), so the merge rules apply here too and re-running the
-- migration is harmless.

do $$
declare w record;
begin
  for w in select * from public.waitlist_applications order by created_at loop
    perform public.record_signup(
      p_source       => 'website',
      p_full_name    => w.name,
      p_email        => w.email,
      p_submitted_at => w.created_at,
      p_age          => w.age,
      p_city         => w.city,
      p_pronouns     => w.pronouns,
      p_instagram    => w.instagram,
      p_linkedin     => w.linkedin,
      p_raw          => jsonb_build_object(
                          'migrated_from','waitlist_applications',
                          'original_id', w.id,
                          'status',      w.status,
                          'payload',     w.payload)
    );
  end loop;
end $$;

-- Carry the old table's status into the two new axes. record_signup() cannot
-- write these, so it happens once, here.
--   'new' / 'filled out form' / 'filled form'  -> stage applied
--   'scheduled'                                -> stage scheduled
--   'met' / 'had call'                         -> stage interviewed
--   'taken' / 'not considering' / 'not answering' -> availability
--   'coming'                                   -> event attendance, not a stage;
--                                                 left alone, needs the events table
-- A person can have several rows in the old table (Dana Reyes has two, one
-- 'new' and one 'met'). Joining them all and letting the planner pick is how a
-- 'met' loses to a 'new', so precedence is explicit: a real pipeline value beats
-- the 'new' default, then the furthest-along stage, then the most recent.
with ranked as (
  select distinct on (nullif(lower(btrim(w.email)), ''))
    nullif(lower(btrim(w.email)), '')          as k,
    lower(btrim(coalesce(w.status, '')))       as st
  from public.waitlist_applications w
  where nullif(lower(btrim(w.email)), '') is not null
  order by
    nullif(lower(btrim(w.email)), ''),
    (lower(btrim(coalesce(w.status, ''))) in ('', 'new')),   -- false first
    case lower(btrim(coalesce(w.status, '')))                -- furthest along first
      when 'met' then 0 when 'had call' then 0
      when 'scheduled' then 1
      when 'filled out form' then 2 when 'filled form' then 2
      else 3 end,
    w.created_at desc
)
update public.signups s set
  stage = case ranked.st
            when 'met'             then 'interviewed'
            when 'had call'        then 'interviewed'
            when 'scheduled'       then 'scheduled'
            when 'filled out form' then 'applied'
            when 'filled form'     then 'applied'
            else s.stage
          end,
  availability = case ranked.st
            when 'taken'           then 'taken'
            when 'not considering' then 'not_considering'
            when 'not answering'   then 'not_answering'
            else s.availability
          end
from ranked
where ranked.k = s.email_key;

comment on table public.signups is
  'One row per person across both front doors. Applications enter only through record_signup(). stage, availability, interviewed_at, profile_sent_at and notes are matchmaker-owned; no automated caller can write them.';
comment on table public.dating_profiles is
  'Versioned profile cards. Exactly one is_current row per signup. client_approved marks the text the person themselves signed off on.';
