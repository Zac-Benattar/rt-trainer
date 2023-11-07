-- Add migration script here
CREATE TABLE usercall (
    id SERIAL PRIMARY KEY,
    callsign_stated VARCHAR(5) NOT NULL,
    target_stated VARCHAR(30) NOT NULL,
    callsign_actual VARCHAR(5) NOT NULL,
    target_actual VARCHAR(30) NOT NULL,
    message VARCHAR(255) NOT NULL
);