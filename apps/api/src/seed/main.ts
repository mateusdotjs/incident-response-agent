/**
 * Usage (from apps/api):
 *   npm run db:migrate
 *   npm run db:seed -- --preset deployment-failure
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { seedSharedServices } from './apply';
import { getSeedPreset, isSeedPresetName, SEED_PRESETS } from './presets/index';
import { resetDatabase } from './reset';
import { createClock } from './time';
import type { ServiceIdMap } from './types';

function parsePresetArg(argv: string[]): string | undefined {
  const presetFlagIndex = argv.indexOf('--preset');
  if (presetFlagIndex !== -1) {
    return argv[presetFlagIndex + 1];
  }

  return undefined;
}

async function main() {
  const presetArg = parsePresetArg(process.argv.slice(2));

  if (!presetArg) {
    console.error(
      `Missing preset. Use --preset <name>. Allowed: ${SEED_PRESETS.join(', ')}`,
    );
    process.exit(1);
  }

  if (!isSeedPresetName(presetArg)) {
    console.error(
      `Unknown preset "${presetArg}". Allowed: ${SEED_PRESETS.join(', ')}`,
    );
    process.exit(1);
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const pool = new pg.Pool({ connectionString, max: 2 });
  const db = drizzle({ client: pool });

  try {
    console.log(`Resetting database...`);
    await resetDatabase(db);

    const serviceIds: ServiceIdMap = new Map();
    const ctx = {
      db,
      t: createClock(),
      serviceIds,
    };

    console.log(`Seeding shared services...`);
    await seedSharedServices(ctx);

    console.log(`Applying preset "${presetArg}"...`);
    await getSeedPreset(presetArg)(ctx);

    console.log(`Seed completed: ${presetArg}`);
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
