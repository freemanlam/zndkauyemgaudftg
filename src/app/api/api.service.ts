import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, of, Observable, concat } from 'rxjs';
import { retryWhen, flatMap, take, delay, map } from 'rxjs/operators';

import { SubmitRouteResponse, GetRouteResponse, SubmitRouteRequest, Point } from './dto';
import { RouteStop } from '../models';

import { environment } from '../../environments/environment';

/**
 * Api connector service
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) { }

  /**
   * Get driving route
   */
  getRoute(token: string): Observable<GetRouteResponse> {
    return this.http.get<GetRouteResponse>(`${environment.apiServer}/route/${token}`)
      .pipe(
        flatMap(res => {
          if (res.status === 'success') {
            return of(res);
          }

          // if status !== success, it should be a error
          return throwError(res);
        }),

        // retry when route noy ready
        retryWhen(error => error
          .pipe(
            flatMap(e => {
              if ((e as GetRouteResponse).status === 'in progress') {
                console.log('Route is not ready, now retry...');
                return of(e).pipe(delay(500));
              }

              return throwError(e);
            }),
            // retry 20 times, keep safe if status keep not changed
            take(20),
            o => concat(o, throwError({ error: 'Route is still not ready, you can try again.' }))
          ))
      );
  }

  /**
   * Submit pick-up point and drop-off location
   */
  submitRoute(data: SubmitRouteRequest): Observable<SubmitRouteResponse> {
    return this.http.post<SubmitRouteResponse>(`${environment.apiServer}/route`, data);
  }


  getDrivingRoute(stops: RouteStop[]) {
    return this.submitRoute({
      route: stops.map(s => {
        const { lat, lng } = s.geometry.location;
        return [`${lat()}`, `${lng()}`] as Point;
      })
    })
      .pipe(
        map(res => res.token),
        flatMap(token => this.getRoute(token))
      );
  }

}
