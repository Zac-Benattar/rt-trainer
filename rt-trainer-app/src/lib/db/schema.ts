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
	mediumint
} from 'drizzle-orm/mysql-core';
import type { AdapterAccount } from '@auth/core/adapters';

/**
 * Flight planning data schema
 */

export const frequency = mysqlTable('frequency', {
	id: int('id').autoincrement().primaryKey(),
	openaip_id: varchar('openaip_id', { length: 100 }).notNull().unique(),
	value: varchar('value', { length: 10 }).notNull(),
	name: varchar('name', { length: 100 }).notNull(),
	primary: boolean('primary').notNull(),
	created_at: timestamp('created_at').defaultNow(),
	aeronautical_data_object: int('aeronautical_data_object').references(() => aeronauticalData.id)
});

export const airport = mysqlTable('airport', {
	id: int('id').autoincrement().primaryKey(),
	openaip_id: varchar('openaip_id', { length: 100 }).notNull(),
	name: varchar('name', { length: 100 }).notNull(),
	icao_code: varchar('icao_code', { length: 4 }).default('none'),
	iata_code: varchar('iata_code', { length: 3 }).default('no'),
	alt_identifier: varchar('alt_identifier', { length: 100 }),
	type: tinyint('type').notNull(),
	country: varchar('country', { length: 2 }).notNull(),
	geometry: varchar('geometry', { length: 1000 }).notNull(),
	elevation: smallint('elevation').notNull(),
	traffic_type: varchar('traffic_type', { length: 20 }).notNull(),
	ppr: boolean('ppr'),
	private: boolean('private'),
	skydive_activity: boolean('skydive_activity'),
	winch_only: boolean('winch_only'),
	runways: json('runways'),
	frequencies: json('frequencies'),
	created_at: timestamp('created_at').defaultNow(),
	aeronautical_data_object: int('aeronautical_data_object').references(() => aeronauticalData.id)
});

export const airspace = mysqlTable('airspace', {
	id: int('id').autoincrement().primaryKey(),
	openaip_id: varchar('openaip_id', { length: 100 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	type: tinyint('type').notNull(),
	icao_class: tinyint('icao_class').notNull(),
	activity: tinyint('activity').notNull(),
	on_demand: boolean('on_demand').notNull(),
	on_request: boolean('on_request').notNull(),
	byNotam: boolean('byNotam').notNull(),
	special_agreement: boolean('special_agreement').notNull(),
	request_compliance: boolean('request_compliance').notNull(),
	geometry: varchar('geometry', { length: 10000 }).notNull(),
	centre: varchar('centre', { length: 100 }).notNull(),
	country: varchar('country', { length: 2 }).notNull(),
	upper_limit: mediumint('upper_limit').notNull(),
	lower_limit: mediumint('lower_limit').notNull(),
	upper_limit_max: mediumint('upper_limit_max'),
	lower_limit_min: mediumint('lower_limit_min'),
	created_at: timestamp('created_at').defaultNow(),
	aeronautical_data_object: int('aeronautical_data_object').references(() => aeronauticalData.id)
});

export const airportReportingPoint = mysqlTable('reportingPoint', {
	id: int('id').autoincrement().primaryKey(),
	openaip_id: varchar('openaip_id', { length: 100 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	compulsary: boolean('compulsary').notNull(),
	country: varchar('country', { length: 2 }).notNull(),
	geometry: varchar('geometry', { length: 1000 }).notNull(),
	elevation: smallint('elevation').notNull(),
	// currently comma separated list of
	airports: varchar('airports', { length: 1000 }).notNull(),
	created_at: timestamp('created_at').defaultNow(),
	aeronautical_data_object: int('aeronautical_data_object').references(() => aeronauticalData.id)
});

export const aeronauticalDataType = mysqlTable('aeronauticalDataType', {
	id: int('id').autoincrement().primaryKey(),
	name: varchar('name', { length: 100 }).notNull(),
	created_at: timestamp('created_at').defaultNow()
});

export const aeronauticalData = mysqlTable('aeronauticalData', {
	id: int('id').autoincrement().primaryKey(),
	type: int('type').references(() => aeronauticalDataType.id),
	created_at: timestamp('created_at').defaultNow()
});

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

export const accounts = mysqlTable(
	'account',
	{
		userId: varchar('userId', { length: 255 })
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
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

export const sessions = mysqlTable('session', {
	sessionToken: varchar('sessionToken', { length: 255 }).notNull().primaryKey(),
	userId: varchar('userId', { length: 255 })
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires', { mode: 'date' }).notNull()
});

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
