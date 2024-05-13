export type Position = { lat: number; lng: number };

export interface Location {
  id: number;
  applicant: string;
  locationDescription: string;
  address: string;
  type: string;
  tags: string;
  position: Position;
  schedule?: string;
}
