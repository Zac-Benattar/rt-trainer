import type { Config } from 'drizzle-kit';

const config: Config = {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	driver: 'pg',
	dbCredentials: {
		connectionString:
			process.env.POSTGRES_URL!
	}
};

export default config;
