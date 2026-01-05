/**
 * Manual Registry
 *
 * Central registry for all manuals with explicit imports.
 * Required for Next.js static export - no dynamic require() allowed.
 */

import type { ManualManifest, ManualPart } from './types/manual';

// Import oxi-one-mk2 manifest
import oxiOneMk2Manifest from '@/public/manuals/oxi-one-mk2/data/manifest.json';

// Import all oxi-one-mk2 parts
import oxiOneMk2Part01 from '@/public/manuals/oxi-one-mk2/data/part-01.json';
import oxiOneMk2Part02 from '@/public/manuals/oxi-one-mk2/data/part-02.json';
import oxiOneMk2Part03 from '@/public/manuals/oxi-one-mk2/data/part-03.json';
import oxiOneMk2Part04 from '@/public/manuals/oxi-one-mk2/data/part-04.json';
import oxiOneMk2Part05 from '@/public/manuals/oxi-one-mk2/data/part-05.json';
import oxiOneMk2Part06 from '@/public/manuals/oxi-one-mk2/data/part-06.json';
import oxiOneMk2Part07 from '@/public/manuals/oxi-one-mk2/data/part-07.json';
import oxiOneMk2Part08 from '@/public/manuals/oxi-one-mk2/data/part-08.json';
import oxiOneMk2Part09 from '@/public/manuals/oxi-one-mk2/data/part-09.json';
import oxiOneMk2Part10 from '@/public/manuals/oxi-one-mk2/data/part-10.json';

// Import oxi-coral manifest
import oxiCoralManifest from '@/public/manuals/oxi-coral/data/manifest.json';

// Import all oxi-coral parts
import oxiCoralPart01 from '@/public/manuals/oxi-coral/data/part-01.json';
import oxiCoralPart02 from '@/public/manuals/oxi-coral/data/part-02.json';

// Build part registry for oxi-one-mk2
const OXI_ONE_MK2_PARTS: Record<string, ManualPart> = {
  '01': oxiOneMk2Part01 as unknown as ManualPart,
  '02': oxiOneMk2Part02 as unknown as ManualPart,
  '03': oxiOneMk2Part03 as unknown as ManualPart,
  '04': oxiOneMk2Part04 as unknown as ManualPart,
  '05': oxiOneMk2Part05 as unknown as ManualPart,
  '06': oxiOneMk2Part06 as unknown as ManualPart,
  '07': oxiOneMk2Part07 as unknown as ManualPart,
  '08': oxiOneMk2Part08 as unknown as ManualPart,
  '09': oxiOneMk2Part09 as unknown as ManualPart,
  '10': oxiOneMk2Part10 as unknown as ManualPart,
};

// Build part registry for oxi-coral
const OXI_CORAL_PARTS: Record<string, ManualPart> = {
  '01': oxiCoralPart01 as unknown as ManualPart,
  '02': oxiCoralPart02 as unknown as ManualPart,
};

export interface ManualRegistryEntry {
  manifest: ManualManifest;
  parts: Record<string, ManualPart>;
}

/**
 * Global registry of all available manuals
 * To add a new manual:
 * 1. Import manifest and parts
 * 2. Create parts record
 * 3. Add entry to MANUAL_REGISTRY
 */
const MANUAL_REGISTRY: Record<string, ManualRegistryEntry> = {
  'oxi-one-mk2': {
    manifest: oxiOneMk2Manifest as unknown as ManualManifest,
    parts: OXI_ONE_MK2_PARTS,
  },
  'oxi-coral': {
    manifest: oxiCoralManifest as unknown as ManualManifest,
    parts: OXI_CORAL_PARTS,
  },
};

/**
 * Get manifest for a specific manual
 */
export function getManifest(manualId: string): ManualManifest {
  const entry = MANUAL_REGISTRY[manualId];
  if (!entry) {
    throw new Error(`Manual not found: ${manualId}`);
  }
  return entry.manifest;
}

/**
 * Get part data for a specific manual and part number
 */
export function getPartData(manualId: string, partNum: string): ManualPart | null {
  const entry = MANUAL_REGISTRY[manualId];
  if (!entry) {
    return null;
  }
  return entry.parts[partNum] || null;
}

/**
 * Get list of all available manual IDs
 */
export function getAvailableManuals(): string[] {
  return Object.keys(MANUAL_REGISTRY);
}

/**
 * Check if a manual ID is valid
 */
export function isValidManual(manualId: string): boolean {
  return manualId in MANUAL_REGISTRY;
}
