import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapComponent, MAP_NOT_INIT_MSG } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
    component.config = {
      center: { lat: 0, lng: 0 }
    };
    expect(component.map).toBeUndefined();
    fixture.detectChanges();
    expect(component.map).toBeDefined();
  });

  it('can\'t do anything before call initMap', () => {
    const payload: any = {};
    expect(() => component.createMarker(payload)).toThrowError(MAP_NOT_INIT_MSG);
    expect(() => component.createPolyline(payload)).toThrowError(MAP_NOT_INIT_MSG);
    expect(() => component.zoomLocation(payload)).toThrowError(MAP_NOT_INIT_MSG);
    expect(() => component.zoomRoute(payload)).toThrowError(MAP_NOT_INIT_MSG);
  });

  describe('after inited', () => {
    let map: google.maps.Map;
    beforeEach(() => {
      component.config = {
        center: { lat: 0, lng: 0 }
      };
      fixture.detectChanges();
      map = component.map;
    });

    it('should create a marker on map', () => {
      const marker = component.createMarker({ lat: 1, lng: 2 });
      expect(marker).toBeDefined();
      expect(marker.getMap()).toEqual(map);
    });

    it('should create polyline on map', () => {
      const polyline = component.createPolyline([
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        { lat: 2, lng: 2 }
      ]);
      expect(polyline).toBeDefined();
      expect(polyline.getMap()).toEqual(map);
    });

    it('should zoom to fit a bound', () => {
      const geometry = {
        location: null,
        viewport: { east: 1, north: 0, south: 1, west: 0 } as any
      };
      component.zoomLocation(geometry);
      const center = map.getCenter();
      expect(center.lat()).toBe(0.5);
      expect(center.lng()).toBe(0.5);
    });

    it('should zoom to a point', () => {
      const geometry = {
        location: { lat: 0, lng: 0 } as any,
        viewport: null
      };
      component.zoomLocation(geometry);
      const center = map.getCenter();
      expect(center.lat()).toBe(0);
      expect(center.lng()).toBe(0);
    });

    it('should zoom to a route without offset', () => {
      const path = [
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        { lat: 2, lng: 2 }
      ];
      component.zoomRoute(path);
      const center = map.getCenter();
      expect(center.lat()).toBe(1);
      expect(center.lng()).toBe(1);
    });

    it('should zoom to a route with offset', () => {
      const path = [
        { lat: 0, lng: 0 },
        { lat: 1, lng: 1 },
        { lat: 2, lng: 2 }
      ];
      component.zoomOffset = {
        top: 300,
        bottom: 0,
        left: 0,
        right: 0
      };
      component.zoomRoute(path);
      const center = map.getCenter();
      expect(center.lat()).not.toBe(1);
      expect(center.lng()).toBe(1);
    });
  });
});
