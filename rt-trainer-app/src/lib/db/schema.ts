import type { AdapterAccount } from '@auth/core/adapters';
import { relations } from 'drizzle-orm';
import { init } from '@paralleldrive/cuid2';
import {
	boolean,
	decimal,
	integer,
	pgTable,
	primaryKey,
	smallint,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

export enum Visibility {
	PRIVATE = 1,
	UNLISTED = 2,
	PUBLIC = 3
}

const shortCUID = init({ length: 12 });
const longCUID = init({ length: 20 });

/**
 * Route data schema
 */
export const waypointsTable = pgTable('waypoint', {
	id: text('id').primaryKey().$defaultFn(shortCUID),
	index: smallint('index').notNull(), // Holds the position of the point in the route
	type: smallint('type').notNull(), // Type of route point e.g. cross between MATZ and ATZ, etc.
	name: varchar('name', { length: 100 }).notNull(),
	description: varchar('description', { length: 2000 }),
	lat: decimal('lat', { precision: 10, scale: 8 }).notNull(),
	lng: decimal('long', { precision: 10, scale: 8 }).notNull(),
	referenceObjectId: text('reference_object_id'),
	routeId: varchar('route_id', { length: 12 }).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const waypointsRelations = relations(waypointsTable, ({ one }) => ({
	route: one(routesTable, { fields: [waypointsTable.routeId], references: [routesTable.id] })
}));

// Eventually replace json with another table
export const routesTable = pgTable('route', {
	id: text('id').primaryKey().$defaultFn(shortCUID),
	userID: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }).notNull(),
	type: smallint('type').notNull(),
	visibility: smallint('visibility').notNull(),
	description: varchar('description', { length: 2000 }),
	airspaceIds: text('airspace_ids'),
	airportIds: text('airport_ids'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const routesRelations = relations(routesTable, ({ many }) => ({
	scenarios: many(scenariosTable),
	waypoints: many(waypointsTable)
}));

export const scenariosTable = pgTable('scenario', {
	id: text('id').primaryKey().$defaultFn(longCUID),
	userID: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }).notNull(),
	visibility: smallint('visibility').notNull(),
	description: varchar('description', { length: 2000 }),
	route: text('route_id').references(() => routesTable.id, { onDelete: 'cascade' }),
	seed: varchar('seed', { length: 20 }).notNull().$defaultFn(shortCUID),
	hasEmergency: boolean('has_emergency').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const scenariosRelations = relations(scenariosTable, ({ one }) => ({
	routes: one(routesTable, { fields: [scenariosTable.route], references: [routesTable.id] })
}));

/**
 * User tables schema
 */

export const users = pgTable('user', {
	id: text('id').primaryKey().$defaultFn(shortCUID),
	name: text('name'),
	email: text('email').notNull(),
	emailVerified: timestamp('emailVerified', { mode: 'date' }),
	image: text('image'),
	accountType: text('accountType').notNull().default('basic_user'),
	prefix: text('prefix').notNull().default('STUDENT'),
	callsign: text('callsign').notNull().default('G-OFLY'),
	aircraftType: text('aircraftType').notNull().default('Cessna 172')
});

export const accounts = pgTable(
	'account',
	{
		userId: text('userId')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		type: text('type').$type<AdapterAccount['type']>().notNull(),
		provider: text('provider').notNull(),
		providerAccountId: text('providerAccountId').notNull(),
		refresh_token: text('refresh_token'),
		access_token: text('access_token'),
		expires_at: integer('expires_at'),
		token_type: text('token_type'),
		scope: text('scope'),
		id_token: text('id_token'),
		session_state: text('session_state')
	},
	(account) => ({
		compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] })
	})
);

export const sessions = pgTable('session', {
	sessionToken: text('sessionToken').notNull().primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const verificationTokens = pgTable(
	'verificationToken',
	{
		identifier: text('identifier').notNull(),
		token: text('token').notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull()
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
	})
);
