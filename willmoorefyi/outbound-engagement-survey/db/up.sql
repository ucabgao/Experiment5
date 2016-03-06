CREATE TABLE person (
id serial PRIMARY KEY,
email VARCHAR(255) DEFAULT NULL,
name VARCHAR(50) DEFAULT NULL
);

CREATE TABLE iteration (
id serial PRIMARY KEY,
name VARCHAR(50) NOT NULL,
date_retro_start date NOT NULL,
date_retro_end date NOT NULL
);

CREATE TABLE results (
id serial PRIMARY KEY,
user_id integer REFERENCES person (id),
iteration_id integer REFERENCES iteration (id),
fit smallint NOT NULL,
proud smallint NOT NULL,
excited smallint NOT NULL,
meaningful smallint NOT NULL,
company smallint NOT NULL,
CONSTRAINT user_results UNIQUE(user_id, iteration_id)
);