import type { SeedPreset } from '../types';
import { seedDatabaseOverload } from './database-overload';
import { seedDeploymentFailure } from './deployment-failure';
import { seedHealthy } from './healthy';
import { seedPaymentProviderDegradation } from './payment-provider-degradation';

export const SEED_PRESETS = [
  'deployment-failure',
  'payment-provider-degradation',
  'database-overload',
  'healthy',
] as const;

export type SeedPresetName = (typeof SEED_PRESETS)[number];

const presetRunners: Record<SeedPresetName, SeedPreset> = {
  'deployment-failure': seedDeploymentFailure,
  'payment-provider-degradation': seedPaymentProviderDegradation,
  'database-overload': seedDatabaseOverload,
  healthy: seedHealthy,
};

export function isSeedPresetName(value: string): value is SeedPresetName {
  return (SEED_PRESETS as readonly string[]).includes(value);
}

export function getSeedPreset(name: SeedPresetName): SeedPreset {
  return presetRunners[name];
}
