import { Component, ViewChild, EventEmitter } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { LocationInputDirective } from './location-input.directive';

@Component({
  template: `
    <div #mapEl></div>
    <input type="text"
      appLocationInput
      [map]="map"
      (locationChanged)="locationChanged.next($event)"
      *ngIf="map">
  `
})
class TestComponent {
  @ViewChild('mapEl') mapEl: HTMLDivElement;
  @ViewChild(LocationInputDirective) directive: LocationInputDirective;

  map = new google.maps.Map(this.mapEl);
  locationChanged = new Subject<google.maps.places.PlaceGeometry>();
}

describe('LocationInputDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let component: TestComponent;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        LocationInputDirective
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should not created before first tick', () => {
    let directive = component.directive;
    expect(directive).toBeUndefined();
  });

  describe('after inited', () => {
    let directive: LocationInputDirective;

    beforeEach(() => {
      fixture.detectChanges();
      directive = component.directive;
    });

    it('should be created and inited', () => {
      expect(directive).toBeTruthy();
      expect(directive.map).toBeDefined();
      expect(directive.locationChanged instanceof EventEmitter).toBeTruthy();
    });


    it('should emit event when google.maps.places.autocomplete changed place', done => {
      component.locationChanged
        .subscribe(geometry => {
          expect(geometry).toBeDefined();
          done();
        });

      const listener = (directive.autocomplete as any).listeners.find(l => l.eventName === 'place_changed');
      expect(listener).toBeDefined();

      // if no result, event will not emit
      (directive.autocomplete as any)._placeResult = {
        geometry: {
          location: {
            lat: () => 0,
            lng: () => 0
          },
          viewport: null
        }
      };
      listener.handler();
    });

    it('shouldn\'t emit event when google.maps.places.autocomplete changed without place', () => {
      component.locationChanged
        .subscribe(() => fail('shouldn\'t emit if no place return by autocomplete'));

      const listener = (directive.autocomplete as any).listeners.find(l => l.eventName === 'place_changed');
      expect(listener).toBeDefined();
      listener.handler();
    });
  });
});
