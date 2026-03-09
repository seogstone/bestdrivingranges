export const FACILITY_TYPES = ["outdoor", "indoor", "both"] as const;

export type FacilityType = (typeof FACILITY_TYPES)[number];

export type PriceBucket = "budget" | "mid" | "premium" | "unknown";

export interface Range {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  postcode: string;
  latitude: number;
  longitude: number;
  facility_type: FacilityType;
  bays: number | null;
  covered_bays: boolean;
  floodlights: boolean;
  short_game_area: boolean;
  simulator_brand: string | null;
  price_100_balls: number | null;
  price_bucket: PriceBucket;
  website: string | null;
  phone: string | null;
  opening_hours: string | null;
  image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  distance_km?: number;
}

export interface RangeFilters {
  city?: string;
  facilityType?: FacilityType;
  coveredBays?: boolean;
  floodlights?: boolean;
  shortGameArea?: boolean;
  simulatorBrand?: string;
  priceBucket?: PriceBucket;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
  sort?: "name_asc" | "price_asc" | "price_desc" | "distance";
}

export interface RangeListResponse {
  ranges: Range[];
  page: number;
  pageSize: number;
  total: number;
}

export interface RangeDetailResponse {
  range: Range;
  nearby: Range[];
}

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface SubmissionCreateInput {
  name: string;
  address: string;
  city: string;
  postcode: string;
  facility_type: FacilityType;
  bays?: number | null;
  covered_bays?: boolean | null;
  floodlights?: boolean | null;
  short_game_area?: boolean | null;
  simulator_brand?: string | null;
  price_100_balls?: number | null;
  website?: string | null;
  phone?: string | null;
  opening_hours?: string | null;
  images?: string[];
  submitter_email?: string | null;
}

export interface AdminSubmissionReviewInput {
  reviewNotes?: string;
}

export interface SubmissionRecord extends SubmissionCreateInput {
  id: string;
  latitude: number | null;
  longitude: number | null;
  status: SubmissionStatus;
  review_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export interface CityResponse {
  city: string;
  total: number;
  ranges: Range[];
  page: number;
  pageSize: number;
}
