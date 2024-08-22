create table videos (
  id serial not null primary key,
  url text not null,
  title text,
  created_by uuid default uuid_generate_v4(),
  created_at timestamp default now() not null
);

create table summaries (
  id serial not null primary key,
  video_id integer references videos (id),
  content text not null,
  created_by uuid default uuid_generate_v4(),
  created_at timestamp default now() not null
);

create table transcriptions (
  id serial not null primary key,
  video_id integer references videos (id),
  content text not null,
  created_by uuid default uuid_generate_v4(),
  created_at timestamp default now() not null
);

