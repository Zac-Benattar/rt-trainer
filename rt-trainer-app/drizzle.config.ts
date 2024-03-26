import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		uri: process.env.DEV_DATABASE_URL ?? ''
	}
} satisfies Config;
