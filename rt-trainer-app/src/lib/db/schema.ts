import { mysqlTable, json, int, timestamp } from 'drizzle-orm/mysql-core';

export const airport = mysqlTable('airport', {
    id: int('id').autoincrement().primaryKey(),
    json: json('json').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

export const airspace = mysqlTable('airspace', {
    id: int('id').autoincrement().primaryKey(),
    json: json('json').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});

export const airportReportingPoint = mysqlTable('reportingPoint', {
    id: int('id').autoincrement().primaryKey(),
    json: json('json').notNull(),
    created_at: timestamp('created_at').defaultNow(),
});
