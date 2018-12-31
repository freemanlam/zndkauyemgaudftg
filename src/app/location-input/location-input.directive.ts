import { Directive, ElementRef, Input, Output, EventEmitter, OnInit } from '@angular/core';

/**
 * Provide autocomplete result from google maps api when input value change
 */
@Directive({
  selector: 'input[appLocationInput]'
})
export class LocationInputDirective implements OnInit {

  @Input() map: google.maps.Map;

  @Output() locationChanged = new EventEmitter<google.maps.places.PlaceGeometry>();

  autocomplete: google.maps.places.Autocomplete;

  constructor(
    private el: ElementRef<HTMLInputElement>
  ) { }

  ngOnInit() {
    this.autocomplete = new google.maps.places.Autocomplete(this.el.nativeElement);
    this.autocomplete.bindTo('bounds', this.map);

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();

      if (place) {
        this.locationChanged.emit(place.geometry);
      }
    });
  }

}
