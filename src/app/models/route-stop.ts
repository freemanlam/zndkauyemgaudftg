export interface RouteStop {
  description: string;
  address?: string;
  geometry?: google.maps.places.PlaceGeometry;
  marker?: google.maps.Marker;
}
