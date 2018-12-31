import { Component, Injectable, Input, Output, EventEmitter, OnInit, ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material';
import { of, throwError } from 'rxjs';
import { delay, concatMap } from 'rxjs/operators';

import { AppComponent } from './app.component';
import { ApiService, GetRouteResponse } from './api';
import { RouteStop } from './models';

@Injectable()
class TestMatSnackBar {
  open(message, action, config?) { }
}

@Injectable()
class TestApiService {
  getDrivingRoute(stops) { }
}

@Component({
  selector: 'app-map',
  template: ''
})
class TestMapComponent implements OnInit {
  @Input() config: {
    center: google.maps.LatLngLiteral
  };
  @Input() zoomOffset: google.maps.Padding;
  @Output() mapInit = new EventEmitter<google.maps.Map>();

  map: google.maps.Map;

  constructor(
    private el: ElementRef
  ) { }

  ngOnInit() {
    this.map = new google.maps.Map(this.el.nativeElement, {
      center: this.config.center
    });
    this.mapInit.emit(this.map);
  }

  createMarker(latLng: google.maps.LatLngLiteral) {
    return new google.maps.Marker({ position: latLng });
  }

  zoomLocation(geometry: google.maps.places.PlaceGeometry) { }

  createPolyline(path: google.maps.LatLngLiteral[]) {
    return new google.maps.Polyline({
      path: path
    });
  }

  zoomRoute(path: google.maps.LatLngLiteral[]) { }
}

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let app: AppComponent;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatSnackBar,
          useClass: TestMatSnackBar
        },
        {
          provide: ApiService,
          useClass: TestApiService
        }
      ],
      declarations: [
        AppComponent,
        TestMapComponent
      ],
      schemas: [
        // add this can ignore components/directives won't need to include in test
        // e.g. LocationInputDirective, ControlsComponent
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
  });

  it('should create the app', () => {
    expect(app).toBeTruthy();
    expect(app.map).toBeUndefined();
  });

  it('should get map after ngOnInit', done => {
    fixture.detectChanges();
    expect(app.map).toBeUndefined();
    setTimeout(() => {
      expect(app.map).toBeDefined();
      done();
    });
  })

  describe('after inited', () => {
    let map: google.maps.Map;

    beforeEach(done => {
      fixture.detectChanges();
      setTimeout(() => {
        map = app.map;
        done();
      });
    });

    describe('#onLocationSelected', () => {
      const stop: RouteStop = {
        description: 'stop'
      };
      const geometry: google.maps.places.PlaceGeometry = {
        location: { lat: 0, lng: 0 } as any,
        viewport: null
      };

      it('should create and draw marker, and zoom to location marked when location selected', () => {
        app.onLocationSelected(stop, geometry);
        expect(stop.marker).toBeDefined();
      });

      it('should change exist marker position and set it visible when location selected again', () => {
        app.onLocationSelected(stop, geometry);
        expect(stop.marker).toBeDefined();

        // should be same reference
        const marker = stop.marker;
        app.onLocationSelected(stop, geometry);
        expect(stop.marker).toEqual(marker);
      });
    });

    describe('#onSubmitRoute', () => {
      let apiService: ApiService;

      beforeEach(() => {
        apiService = TestBed.get(ApiService);
      });

      it('should draw and zoom result route from api', done => {
        const response: GetRouteResponse = {
          status: 'success',
          path: [
            ['22.372081', '114.107877'],
            ['2.326442', '114.167811'],
            ['22.284419', '114.159510']
          ],
          total_distance: 20000,
          total_time: 1800
        };
        const apiSpy = spyOn(apiService, 'getDrivingRoute').and.returnValue(of(response)
          .pipe(delay(1))
        );

        app.stops = [
          { description: '', geometry: { location: { lat: () => 0, lng: () => 0 } } as any },
          { description: '', geometry: { location: { lat: () => 1, lng: () => 0 } } as any }
        ];
        app.onSubmitRoute();

        setTimeout(() => {
          const calls = apiSpy.calls.count();
          expect(calls).toBe(1);
          expect(app.processing).toBe(false);
          expect(app.result).toBeDefined();
          expect(app.errorResult).toBeNull();

          // content is displaying on page
          fixture.detectChanges();
          const compiled = fixture.debugElement.nativeElement;
          const distanceDiv = compiled.querySelector('.route-distance');
          expect(distanceDiv.textContent).toContain('Total distance: 20000');
          const timeDiv = compiled.querySelector('.route-time');
          expect(timeDiv.textContent).toContain('Total time: 1800');
          done();
        });
      });

      it('should do nothing if data is not ready', done => {
        const apiSpy = spyOn(apiService, 'getDrivingRoute');
        app.onSubmitRoute();
        setTimeout(() => {
          const calls = apiSpy.calls.count();
          expect(calls).toBe(0);
          done();
        });
      });

      it('shoud show error message if any error caught', done => {
        const snackBar: MatSnackBar = TestBed.get(MatSnackBar);
        const response: GetRouteResponse = {
          status: 'failure',
          error: 'Location not accessible by car'
        };
        const apiSpy = spyOn(apiService, 'getDrivingRoute').and.returnValue(of(null)
          .pipe(
            delay(1),
            // make delay and transform to a error
            concatMap(() => throwError(response)),
          )
        );
        const snackBarSpy = spyOn(snackBar, 'open').and.callFake((message, action, config) => {
          expect(message).toBe(response.error);
        });

        app.stops = [
          { description: '', geometry: { location: { lat: () => 0, lng: () => 0 } } as any },
          { description: '', geometry: { location: { lat: () => 1, lng: () => 0 } } as any }
        ];
        app.onSubmitRoute();

        setTimeout(() => {
          const calls = apiSpy.calls.count();
          expect(calls).toBe(1);
          expect(app.processing).toBe(false);
          expect(app.result).toBeNull();
          expect(app.errorResult).toBeDefined();
          const snackBarCalls = snackBarSpy.calls.count();
          expect(snackBarCalls).toBe(1);
          done();
        });
      });
    });

    describe('#resetStop to specific stop', () => {
      let stop: RouteStop;
      beforeEach(() => {
        stop = {
          description: 'stop'
        };
      });

      it('should clear address', () => {
        stop.address = 'address';
        app.resetStop(stop);
        expect(stop.address).toBeNull();
      });

      it('should clear address also hide marker', () => {
        stop.marker = new google.maps.Marker({
          position: { lat: 0, lng: 0 }
        });
        app.resetStop(stop);
        expect(stop.marker.getVisible()).toBe(false);
      });
    });

    it('#resetForm should clear data', () => {
      app.stops = [
        { description: 'stop 1', address: 'address' },
      ];

      app.resetForm();
      expect(app.stops[0].address).toBeNull();
      expect(app.result).toBeNull();
      expect(app.errorResult).toBeNull();
    });
  });
});
