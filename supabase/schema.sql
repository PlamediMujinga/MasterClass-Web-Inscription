-- ============================================================================
-- Table des inscriptions – à coller dans Supabase > SQL Editor > Run
-- ============================================================================

create table public.inscriptions (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  prenom        text not null check (char_length(prenom) between 2 and 80),
  nom           text not null check (char_length(nom)    between 2 and 80),
  email         text not null check (char_length(email) <= 150
                                     and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'),
  telephone     text not null check (telephone ~ '^\+[0-9]{8,15}$'),

  -- Questionnaire
  connait_web   text not null check (connait_web in ('aucune', 'notions', 'pratique')),
  technologies  text[] not null default '{}'
                check (technologies <@ array['html', 'css', 'bootstrap', 'javascript', 'php', 'mysql']),
  niveau        text check (niveau in ('debutant', 'intermediaire', 'avance'))
);

-- Une seule inscription par adresse mail (majuscules/minuscules ignorées)
create unique index inscriptions_email_unique on public.inscriptions (lower(email));

-- ----------------------------------------------------------------------------
-- Sécurité : le public peut AJOUTER une inscription, mais ne peut rien lire,
-- modifier ni supprimer. Vous consultez les inscrits depuis le tableau de bord
-- Supabase (Table Editor), où vous pouvez aussi exporter en CSV.
-- ----------------------------------------------------------------------------
alter table public.inscriptions enable row level security;

grant insert on public.inscriptions to anon;

create policy "Le public peut s'inscrire"
  on public.inscriptions
  for insert
  to anon
  with check (true);
