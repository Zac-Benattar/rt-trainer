-- Add migration script here
CREATE TABLE usercall (
    id SERIAL PRIMARY KEY,
    callsign VARCHAR(5) NOT NULL,
    target VARCHAR(30) NOT NULL,
    message VARCHAR(255) NOT NULL
);