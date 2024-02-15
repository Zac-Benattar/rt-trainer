import {
	primaryKey,
	mysqlTable,
	json,
	int,
	timestamp,
	varchar,
	boolean,
	tinyint,
	smallint,
	mediumint,
	decimal
} from 'drizzle-orm/mysql-core';
import type { AdapterAccount } from '@auth/core/adapters';
import { relations } from 'drizzle-orm';

/**
 * Aeronautical data schema (For data from OpenAIP)
 */

export const polygonPoints = mysqlTable('polygonPoint', {
	id: int('id').autoincrement().primaryKey(),
	latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
	longitude: decimal('longitude', { precision: 10, scale: 8 }).notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

export const polygonPointsRelations = relations(polygonPoints, ({ one }) => ({
	polygon: one(polygons, { fields: [polygonPoints.id], references: [polygons.id] })
}));

export const polygons = mysqlTable('polygon', {
	id: int('id').autoincrement().primaryKey(),
	airspace: int('airspace').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

export const polygonsRelations = relations(polygons, ({ one, many }) => ({
	airspace: one(airspaces, { fields: [polygons.airspace], references: [airspaces.id] }),
	points: many(polygonPoints)
}));

export const runways = mysqlTable('runway', {
	id: int('id').autoincrement().primaryKey(),
	openaipId: varchar('openaip_id', { length: 100 }).notNull().unique(),
	airportId: int('airport_id').notNull(),
	designator: varchar('designator', { length: 100 }).notNull(),
	trueHeading: smallint('true_heading').notNull(),
	alignedTrueNorth: boolean('aligned_true_north').notNull(),
	operations: tinyint('operations').notNull(),
	mainRunway: boolean('main_runway').notNull(),
	turnDirection: tinyint('turn_direction').notNull(),
	landingOnly: boolean('landing_only').notNull(),
	takeOffOnly: boolean('take_off_only').notNull(),
	lengthValue: smallint('length_value').notNull(),
	lengthUnit: tinyint('length_unit').notNull(),
	widthValue: smallint('width_value').notNull(),
	widthUnit: tinyint('width_unit').notNull(),
	toraValue: smallint('tora_value').notNull(),
	toraUnit: tinyint('tora_unit').notNull(),
	todaValue: smallint('toda_value').notNull(),
	todaUnit: tinyint('toda_unit').notNull(),
	asdaValue: smallint('asda_value').notNull(),
	asdaUnit: tinyint('asda_unit').notNull(),
	ldaValue: smallint('lda_value').notNull(),
	ldaUnit: tinyint('lda_unit').notNull(),
	thresholdCoordinates: varchar('threshold_coordinates', { length: 100 }).notNull(),
	elevationValue: smallint('elevation_value').notNull(),
	elevationUnit: tinyint('elevation_unit').notNull(),
	exclusiveAircraftType: json('exclusive_aircraft_type'),
	pilotCtrlLighting: boolean('pilot_ctrl_lighting').notNull(),
	lightingSystem: json('lighting_system'),
	createdAt: timestamp('created_at').defaultNow()
});

export const runwaysRelations = relations(runways, ({ one }) => ({
	airport: one(airports, { fields: [runways.airportId], references: [airports.id] })
}));

export const frequencies = mysqlTable('frequency', {
	id: int('id').autoincrement().primaryKey(),
	openaipId: varchar('openaip_id', { length: 100 }).notNull().unique(),
	frequencyFor: varchar('frequency_for', { length: 100 }).notNull(),
	value: varchar('value', { length: 10 }).notNull(),
	name: varchar('name', { length: 100 }).notNull(),
	primary: boolean('primary').notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

export const frequenciesRelations = relations(frequencies, ({ one }) => ({
	airports: one(airports, { fields: [frequencies.frequencyFor], references: [airports.openaipId] })
}));

export const airports = mysqlTable('airport', {
	id: int('id').autoincrement().primaryKey(),
	openaipId: varchar('openaip_id', { length: 100 }).notNull(),
	name: varchar('name', { length: 100 }).notNull(),
	icaoCode: varchar('icao_code', { length: 4 }).default('none'),
	iataCode: varchar('iata_code', { length: 3 }).default('no'),
	altIdentifier: varchar('alt_identifier', { length: 100 }),
	type: tinyint('type').notNull(),
	country: varchar('country', { length: 2 }).notNull(),
	latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
	longitude: decimal('longitude', { precision: 10, scale: 8 }).notNull(),
	elevation: smallint('elevation').notNull(),
	trafficType: varchar('traffic_type', { length: 20 }).notNull(),
	ppr: boolean('ppr'),
	private: boolean('private'),
	skydiveActivity: boolean('skydive_activity'),
	winchOnly: boolean('winch_only'),
	runways: json('runways'),
	frequencies: json('frequencies'),
	createdAt: timestamp('created_at').defaultNow()
});

export const airportsRelations = relations(airports, ({ many }) => ({
	runways: many(runways),
	frequencies: many(frequencies)
}));

export const airspaces = mysqlTable('airspace', {
	id: int('id').autoincrement().primaryKey(),
	openaipId: varchar('openaip_id', { length: 100 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	type: tinyint('type').notNull(),
	icaoClass: tinyint('icao_class').notNull(),
	activity: tinyint('activity').notNull(),
	onDemand: boolean('on_demand').notNull(),
	onRequest: boolean('on_request').notNull(),
	byNotam: boolean('byNotam').notNull(),
	specialAgreement: boolean('special_agreement').notNull(),
	requestCompliance: boolean('request_compliance').notNull(),
	centre: varchar('centre', { length: 100 }).notNull(),
	country: varchar('country', { length: 2 }).notNull(),
	upperLimit: mediumint('upper_limit').notNull(),
	lowerLimit: mediumint('lower_limit').notNull(),
	upperLimitMax: mediumint('upper_limit_max'),
	lowerLimit_Min: mediumint('lower_limit_min'),
	createdAt: timestamp('created_at').defaultNow()
});

export const airspacesRelations = relations(airspaces, ({ many }) => ({
	polygons: many(polygons)
}));

export const airportReportingPoints = mysqlTable('reportingPoint', {
	id: int('id').autoincrement().primaryKey(),
	openaipId: varchar('openaip_id', { length: 100 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	compulsary: boolean('compulsary').notNull(),
	country: varchar('country', { length: 2 }).notNull(),
	latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
	longitude: decimal('longitude', { precision: 10, scale: 8 }).notNull(),
	elevation: smallint('elevation').notNull(),
	// currently comma separated list of
	airports: varchar('airports', { length: 100 }).notNull(),
	createdAt: timestamp('created_at').defaultNow()
});

/**
 * Route data schema
 */

export const routePoints = mysqlTable('routePoint', {
	id: int('id').autoincrement().primaryKey(),
	index: smallint('index').notNull(), // Holds the position of the point in the route
	type: tinyint('type').notNull(), // Type of route point e.g. cross between MATZ and ATZ, etc.
	name: varchar('name', { length: 100 }).notNull(),
	description: varchar('description', { length: 2000 }),
	latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
	longitude: decimal('longitude', { precision: 10, scale: 8 }).notNull(),
	routeId: int('route_id').notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const routePointsRelations = relations(routePoints, ({ one }) => ({
	route: one(routes, { fields: [routePoints.routeId], references: [routes.id] })
}));

export const routes = mysqlTable('route', {
	id: int('id').autoincrement().primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
	createdBy: int('created_by').notNull()
});

export const routesRelations = relations(routes, ({ one, many }) => ({
	users: one(users, { fields: [routes.createdBy], references: [users.id] }),
	routePoints: many(routePoints),
	airspace: many(routesToAirspaces)
}));

export const routesToAirspaces = mysqlTable(
	'routes_to_airspaces',
	{
		routeId: int('route_id').notNull(),
		airspaceId: int('airspace_id').notNull()
	},
	(t) => ({
		compoundKey: primaryKey({
			columns: [t.routeId, t.airspaceId]
		})
	})
);

export const routesToAirspacesRelations = relations(routesToAirspaces, ({ one }) => ({
	routes: one(routes, {
		fields: [routesToAirspaces.routeId],
		references: [routes.id]
	}),
	airspaces: one(airspaces, {
		fields: [routesToAirspaces.airspaceId],
		references: [airspaces.id]
	})
}));

/**
 * User tables schema
 */

export const users = mysqlTable('user', {
	id: varchar('id', { length: 255 }).notNull().primaryKey(),
	name: varchar('name', { length: 255 }),
	email: varchar('email', { length: 255 }).notNull(),
	emailVerified: timestamp('emailVerified', { mode: 'date', fsp: 3 }).defaultNow(),
	image: varchar('image', { length: 255 })
});

export const usersRelations = relations(users, ({ many }) => ({
	routes: many(routes),
	accounts: many(accounts),
	sessions: many(sessions)
}));

export const accounts = mysqlTable(
	'account',
	{
		userId: varchar('userId', { length: 255 }).notNull(),
		type: varchar('type', { length: 255 }).$type<AdapterAccount['type']>().notNull(),
		provider: varchar('provider', { length: 255 }).notNull(),
		providerAccountId: varchar('providerAccountId', { length: 255 }).notNull(),
		refresh_token: varchar('refresh_token', { length: 255 }),
		access_token: varchar('access_token', { length: 255 }),
		expires_at: int('expires_at'),
		token_type: varchar('token_type', { length: 255 }),
		scope: varchar('scope', { length: 255 }),
		id_token: varchar('id_token', { length: 2048 }),
		session_state: varchar('session_state', { length: 255 })
	},
	(account) => ({
		compoundKey: primaryKey({
			columns: [account.provider, account.providerAccountId]
		})
	})
);

export const accountsRelations = relations(accounts, ({ one }) => ({
	users: one(users, { fields: [accounts.userId], references: [users.id] })
}));

export const sessions = mysqlTable('session', {
	sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
	userId: varchar('userId', { length: 255 }).notNull(),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	users: one(users, { fields: [sessions.userId], references: [users.id] })
}));

export const verificationTokens = mysqlTable(
	'verificationToken',
	{
		identifier: varchar('identifier', { length: 255 }).notNull(),
		token: varchar('token', { length: 255 }).notNull(),
		expires: timestamp('expires', { mode: 'date' }).notNull()
	},
	(vt) => ({
		compoundKey: primaryKey({ columns: [vt.identifier, vt.token] })
	})
);
