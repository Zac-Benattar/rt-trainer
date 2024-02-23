import 'dotenv/config';
import { drizzle } from 'drizzle-orm/planetscale-serverless';
import { Client } from '@planetscale/database';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

// create the connection
const client = new Client({
	host: env.DATABASE_HOST,
	username: env.DEV_DATABASE_USERNAME,
	password: env.DEV_DATABASE_PASSWORD
});

export const db = drizzle(client, { schema });
