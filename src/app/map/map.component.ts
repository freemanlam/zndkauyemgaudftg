import { Component, ChangeDetectionStrategy, ViewEncapsulation, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';

export const MAP_NOT_INIT_MSG = '[Map] Map is not init.';

/**
 * Wrapped google maps instance
 */
@Component({
  selector: 'app-map',
  template: '',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MapComponent implements OnInit {
  @Input() config: {
    center: google.maps.LatLngLiteral
  };

  @Input() zoomOffset: google.maps.Padding;

  map: google.maps.Map;

  @Output() mapInit = new EventEmitter<google.maps.Map>();

  constructor(
    private el: ElementRef
  ) { }

  ngOnInit() {
    console.log('[Map] initMap');
    this.map = new google.maps.Map(this.el.nativeElement, {
      center: this.config.center,
      zoom: 15,
      fullscreenControl: false,
      mapTypeControl: false
    });
    this.mapInit.emit(this.map);
  }

  createMarker(latLng: google.maps.LatLngLiteral) {
    if (!this.map) {
      throw new Error(MAP_NOT_INIT_MSG);
    }

    console.log(`[Map] Create marker on ${latLng}`);
    return new google.maps.Marker({
      map: this.map,
      anchorPoint: new google.maps.Point(0, -29),
      position: latLng,
      visible: true
    });
  }

  createPolyline(path: google.maps.LatLngLiteral[]) {
    if (!this.map) {
      throw new Error(MAP_NOT_INIT_MSG);
    }

    console.log(`[Map] Create route on ${JSON.stringify(path)}`);
    return new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: this.map
    });
  }

  zoomLocation(geometry: google.maps.places.PlaceGeometry) {
    if (!this.map) {
      throw new Error(MAP_NOT_INIT_MSG);
    }

    console.log(`[Map] Zoom location: ${geometry.viewport}  ${geometry.location}`);
    if (geometry.viewport) {
      this.map.fitBounds(geometry.viewport);
    } else {
      this.map.setCenter(geometry.location);
      this.map.setZoom(13);
    }
  }

  zoomRoute(path: google.maps.LatLngLiteral[]) {
    if (!this.map) {
      throw new Error(MAP_NOT_INIT_MSG);
    }

    console.log(`[Map] Zoom path: ${JSON.stringify(path)}`);
    const bounds = new google.maps.LatLngBounds();

    path.forEach(p => bounds.extend(p));
    this.map.fitBounds(bounds, this.zoomOffset);
  }

}
