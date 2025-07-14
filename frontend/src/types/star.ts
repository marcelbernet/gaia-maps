export interface StarData {
  source_id?: string | number;
  SOURCE_ID?: string | number;
  ra?: number;
  dec?: number;
  phot_g_mean_mag?: number;
  bp_rp?: number;
  alt_diff?: number;
  az_diff?: number;
  base_lat?: number;
  base_lng?: number;
  [key: string]: any; // Allow additional Gaia fields
} 