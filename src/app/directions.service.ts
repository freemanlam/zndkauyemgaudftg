import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DirectionsService {

  private service = new google.maps.DirectionsService();

  route(request: google.maps.DirectionsRequest) {
    return new Observable<google.maps.DirectionsResult>(observer => {
      this.service.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          observer.next(result);
          observer.complete();
        } else {
          observer.error(status);
        }
      });
    });
  }

}
