import type { AdapterAccount } from '@auth/core/adapters';
import { relations } from 'drizzle-orm';
import { init } from '@paralleldrive/cuid2';
import {
	boolean,
	decimal,
	integer,
	json,
	pgTable,
	primaryKey,
	serial,
	smallint,
	text,
	timestamp,
	varchar
} from 'drizzle-orm/pg-core';

const shortCUID = init({ length: 12 });

/**
 * Route data schema
 */

export const waypoints = pgTable('waypoint', {
	id: serial('id').primaryKey(),
	index: smallint('index').notNull(), // Holds the position of the point in the route
	type: smallint('type').notNull(), // Type of route point e.g. cross between MATZ and ATZ, etc.
	name: varchar('name', { length: 100 }).notNull(),
	description: varchar('description', { length: 2000 }),
	lat: decimal('lat', { precision: 10, scale: 8 }).notNull(),
	long: decimal('long', { precision: 10, scale: 8 }).notNull(),
	routeId: varchar('route_id', { length: 12 }).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const waypointsRelations = relations(waypoints, ({ one }) => ({
	route: one(routes, { fields: [waypoints.routeId], references: [routes.id] })
}));

export const routes = pgTable('route', {
	id: serial('id').notNull().primaryKey(),
	userID: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }).notNull(),
	type: smallint('type').notNull(),
	description: varchar('description', { length: 2000 }),
	airspaceIds: json('airspaceIds').notNull(),
	airportIds: json('airportIds').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
	createdBy: varchar('created_by', { length: 255 }).notNull()
});

export const routesRelations = relations(routes, ({ one, many }) => ({
	users: one(users, { fields: [routes.createdBy], references: [users.id] }),
	scenarios: many(scenarios),
	waypoints: many(waypoints)
}));

export const scenarios = pgTable('scenario', {
	id: serial('id').notNull().primaryKey(),
	userID: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	name: varchar('name', { length: 100 }).notNull(),
	description: varchar('description', { length: 2000 }),
	route: integer('route_id').references(() => routes.id, { onDelete: 'cascade' }),
	seed: varchar('seed', { length: 20 })
		.notNull()
		.$defaultFn(() => shortCUID()),
	hasEmergency: boolean('has_emergency').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
	createdBy: varchar('created_by', { length: 255 }).notNull()
});

export const scenariosRelations = relations(scenarios, ({ one }) => ({
	users: one(users, { fields: [scenarios.createdBy], references: [users.id] }),
	routes: one(routes, { fields: [scenarios.route], references: [routes.id] })
}));

/**
 * User tables schema
 */

export const users = pgTable('user', {
	id: serial('id').primaryKey(),
	name: text('name'),
	email: text('email').notNull(),
	emailVerified: timestamp('emailVerified', { mode: 'date' }),
	image: text('image'),
	prefix: text('prefix').notNull().default('STUDENT'),
	callsign: text('callsign').notNull().default('G-OFLY'),
	aircraftType: text('aircraftType').notNull().default('Cessna 172')
});

export const usersRelations = relations(users, ({ many }) => ({
	routes: many(routes)
}));

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
