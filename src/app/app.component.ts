import { Component, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material';

import { RouteStop } from './models';
import { ApiService, GetRouteResponse } from './api';
import { MapComponent } from './map/map.component';
import { DirectionsService } from './directions.service';
import { DirectionsRendererService } from './directions-renderer.service';

/**
 * The app
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @ViewChild('appMap') mapComponent: MapComponent;
  map: google.maps.Map;
  mapConfig: { center: google.maps.LatLngLiteral } = {
    center: { lat: 22.33524, lng: 114.176169 } // inno centre)
  };
  zoomOffset: google.maps.Padding = {
    top: 300,
    bottom: 0,
    left: 0,
    right: 0
  };

  stops: RouteStop[] = [
    { description: 'Starting location', address: null },
    { description: 'Drop-off point', address: null }
  ];
  private routeLine?: google.maps.Polyline;

  processing = false;
  result?: GetRouteResponse;
  errorResult?;

  constructor(
    private snackBar: MatSnackBar,
    private apiService: ApiService,
    private directionsService: DirectionsService,
    private directionsRenderer: DirectionsRendererService
  ) { }

  setMap(map: google.maps.Map) {
    // prevent change map in first tick
    setTimeout(() => this.map = map);
  }

  private drawMarker(stop: RouteStop, geometry: google.maps.places.PlaceGeometry) {
    stop.geometry = geometry;

    if (!stop.marker) {
      stop.marker = this.mapComponent.createMarker(geometry.location as any);
    } else {
      stop.marker.setPosition(geometry.location);
      stop.marker.setVisible(true);
    }
  }

  private drawRoute(path: google.maps.LatLngLiteral[]) {
    if (this.routeLine) {
      this.routeLine.setPath(path);
      this.routeLine.setVisible(true);
    } else {
      this.routeLine = this.mapComponent.createPolyline(path);
    }
  }

  onLocationSelected(stop: RouteStop, geometry: google.maps.places.PlaceGeometry) {
    this.drawMarker(stop, geometry);
    this.mapComponent.zoomLocation(geometry);
  }

  private isReadyForSubmit() {
    return this.stops.every(s => !!s.geometry);
  }

  onSubmitRoute() {
    if (!this.isReadyForSubmit()) {
      return;
    }

    this.processing = true;
    this.apiService.getDrivingRoute(this.stops)
      .subscribe(res => {
        // update result
        this.processing = false;
        this.result = res;
        this.errorResult = null;
        this.stops.forEach(s => this.resetStop(s));

        // draw route
        const path: google.maps.LatLngLiteral[] = res.path.map(p => ({
          lat: parseFloat(p[0]), lng: parseFloat(p[1])
        }));
        this.getDirections(path);
      }, error => {
        // update result
        this.processing = false;
        this.result = null;
        this.errorResult = error.error;

        // show error message
        const errorMessage = (typeof error.error === 'string') ? error.error : 'Unknown Error.';
        this.showMessage(errorMessage);
      });
  }

  private getDirections(path: google.maps.LatLngLiteral[]) {
    return this.directionsService.route({
      origin: path[0],
      destination: path[path.length - 1],
      waypoints: path
        .filter((p, index) => index !== 0 && index < path.length)
        .map(p => ({
          location: p,
          stopover: false
        })),
      travelMode: google.maps.TravelMode.DRIVING
    })
      .subscribe(
        res => {
          this.directionsRenderer.setMap(this.map);
          this.directionsRenderer.setDirections(res);
          setTimeout(() => this.map.setZoom(this.map.getZoom() - 1), 2);
        },
        error => this.showMessage(error)
      );
  }

  resetStop(stop: RouteStop) {
    stop.address = null;
    if (stop.marker) {
      stop.marker.setVisible(false);
    }
  }

  resetForm() {
    this.stops.forEach(s => this.resetStop(s));
    if (this.routeLine) {
      this.routeLine.setVisible(false);
    }
    this.result = null;
    this.errorResult = null;
    this.directionsRenderer.setMap(null);
  }

  private showMessage(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000
    });
  }

}
