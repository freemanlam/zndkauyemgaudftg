export type Point = [string, string];

export interface GetRouteResponse {
  status: 'success' | 'failure' | 'in progress';

  path?: Point[];
  total_distance?: number;
  total_time?: number;

  error?: string;
}

export interface SubmitRouteRequest {
  route: Point[];
}

export interface SubmitRouteResponse {
  token: string;
}
