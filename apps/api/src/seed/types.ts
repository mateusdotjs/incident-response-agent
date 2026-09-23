import type { Database } from '../drizzle/drizzle-client';
import type { MinutesAgo } from './time';

export const SERVICE_NAMES = [
  'checkout',
  'payment',
  'orders',
  'catalog',
] as const;

export type ServiceName = (typeof SERVICE_NAMES)[number];

export type ServiceIdMap = Map<ServiceName, string>;

export type SeedContext = {
  db: Database;
  t: MinutesAgo;
  serviceIds: ServiceIdMap;
};

export type SeedPreset = (ctx: SeedContext) => Promise<void>;
