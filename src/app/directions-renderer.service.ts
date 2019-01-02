import { Injectable } from '@angular/core';

/**
 * Wrapper of google.maps.DirectionsRenderer
 */
@Injectable({
  providedIn: 'root'
})
export class DirectionsRendererService {

  private renderer = new google.maps.DirectionsRenderer();

  setMap(map?: google.maps.Map) {
    return this.renderer.setMap(map);
  }

  setDirections(directions: google.maps.DirectionsResult) {
    return this.renderer.setDirections(directions);
  }

}
