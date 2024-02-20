import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/db/schema.ts',
	driver: 'mysql2',
	dbCredentials: {
		uri: process.env.DEV_DATABASE_URL ?? ''
	}
} satisfies Config;
