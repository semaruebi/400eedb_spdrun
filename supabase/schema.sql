-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Characters Table
create table if not exists characters (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  element text check (element in ('Pyro', 'Hydro', 'Anemo', 'Electro', 'Dendro', 'Cryo', 'Geo')),
  weapon_type text check (weapon_type in ('Sword', 'Claymore', 'Polearm', 'Bow', 'Catalyst')),
  rarity int check (rarity in (4, 5)),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Records Table
create table if not exists records (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  video_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Record Characters Junction Table
create table if not exists record_characters (
  record_id uuid references records(id) on delete cascade not null,
  character_id uuid references characters(id) on delete cascade not null,
  role text check (role in ('Main DPS', 'Sub DPS', 'Support', 'Healer')),
  constellation int default 0 check (constellation >= 0 and constellation <= 6),
  primary key (record_id, character_id)
);

-- Enable Row Level Security (RLS) - Optional for now but recommended
alter table characters enable row level security;
alter table records enable row level security;
alter table record_characters enable row level security;

-- Create policies (Allow public read for now, easier for dev)
create policy "Allow public read characters" on characters for select using (true);
create policy "Allow public read records" on records for select using (true);
create policy "Allow public read record_characters" on record_characters for select using (true);

-- Allow authenticated users to insert (for future use)
create policy "Allow authenticated insert records" on records for insert with check (true);
-- For now, allow public insert/update to make initial dev easy? Or maybe just authenticated.
-- Let's stick to simple "true" for now to avoid permission issues during dev if not logged in.
-- WARN: In production you'd want proper policies.
create policy "Allow anon insert records" on records for insert with check (true);
create policy "Allow anon insert record_characters" on record_characters for insert with check (true);
create policy "Allow anon insert characters" on characters for insert with check (true);


-- Seed some initial data (Optional)
insert into characters (name, element, weapon_type, rarity) values
('Hu Tao', 'Pyro', 'Polearm', 5),
('Yelan', 'Hydro', 'Bow', 5),
('Zhongli', 'Geo', 'Polearm', 5),
('Xingqiu', 'Hydro', 'Sword', 4),
('Raiden Shogun', 'Electro', 'Polearm', 5),
('Nahida', 'Dendro', 'Catalyst', 5),
('Bennett', 'Pyro', 'Sword', 4),
('Kazuha', 'Anemo', 'Sword', 5)
on conflict (name) do nothing;
