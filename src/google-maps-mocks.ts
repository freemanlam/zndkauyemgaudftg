/**
 * Mock object of google maps for test
 */
(() => {
  class MVCObject {
    listeners: { eventName: string; handler: (...args: any[]) => void }[] = [];

    addListener(eventName, handler) {
      this.listeners.push({
        eventName: eventName,
        handler
      });
    }
    bindTo(key, target, targetKey?, noNotify?) { }
  }

  class Map {
    _center: LatLng;
    _zoom: number;

    fitBounds(bounds, padding?) {
      const lat = (bounds.east + bounds.west) / 2;
      const lng = (bounds.north + bounds.south) / 2;
      this._center = new LatLng(lat, lng);

      if (padding) {
        // just randomly modify center
        this._center._lat += padding.top;
        this._center._lat -= padding.bottom;
        this._center._lng += padding.left;
        this._center._lng -= padding.right;
      }
    }

    setCenter(latLng) {
      this._center = new LatLng(latLng.lat, latLng.lng);
    }

    getCenter() {
      return this._center;
    }

    setZoom(zoom) {
      this._zoom = zoom;
    }
  }

  class LatLng {
    _lat: number;
    _lng: number;

    constructor(lat, lng, noWrap?) {
      this._lat = lat;
      this._lng = lng;
    }

    lat() {
      return this._lat;
    }

    lng() {
      return this._lng;
    }
  }

  class LatLngBounds {
    east = 0;
    north = 0;
    south = 0;
    west = 0;

    extend(point): LatLngBounds {
      const lat = point.lat;
      const lng = point.lng;

      if (lat < this.east) {
        this.east = lat;
      } else if (lat > this.west) {
        this.west = lat;
      }

      if (lng < this.south) {
        this.south = lng;
      } else if (lng > this.north) {
        this.north = lng;
      }

      return this;
    }
  }

  class PlaceGeometry {
    location: LatLng;
    viewport: LatLngBounds;
  }

  interface PlaceResult {
    geometry: PlaceGeometry;
  }

  class Point {
    constructor(public x, public y) { }
  }

  class Marker {
    _map: Map;
    _position: LatLng;
    _visible = true;

    constructor(opts?: { map: Map; position; }) {
      this._map = opts.map;
      this._position = new LatLng(opts.position.lat, opts.position.lng);
    }

    getMap() {
      return this._map;
    }

    setPosition(position) {
      this._position = new LatLng(position.lat, position.lng);
    }

    getVisible() {
      return this._visible;
    }

    setVisible(value: boolean) {
      this._visible = value;
    }
  }

  class Polyline {
    _map: Map;
    _path: LatLng[];

    constructor(opts?: { map: Map; path: any[]; }) {
      this._map = opts.map;
      this._path = opts.path.map(p => new LatLng(p.lat, p.lng));
    }

    getMap() {
      return this._map;
    }
  }

  class Autocomplete extends MVCObject {
    _placeResult: PlaceResult;
    constructor(inputField, opts?) {
      super();
    }
    getPlace(): PlaceResult {
      return this._placeResult;
    }
  }

  const google = {
    maps: {
      Map: Map,
      Point: Point,
      LatLngBounds: LatLngBounds,
      Marker: Marker,
      Polyline: Polyline,
      places: {
        PlaceGeometry: PlaceGeometry,
        Autocomplete: Autocomplete
      }
    }
  };

  window['google'] = window['google'] || google;
})();
