# zndkauyemgaudftg

Demo: [https://zndkauyemgaudftg.firebaseapp.com/](https://zndkauyemgaudftg.firebaseapp.com/)

## Features

- Angular7, Angular Material 7, Google Maps Javascript API
- Get and autocomplete places
- Error retry and handling
- Responsive
- PWA
- Tested

## File Structure

- .spec.ts are test files.

```
src/
  app/
    api/
      api.interceptor   - Handle every http call
      api.service       - Api connector service
      dto.ts            - Data transfer object of api
    controls/           - Wrapper element with styles
    location-input/     - Provide autocomplete result from google maps api when input value change
    map/                - Wrapped google maps instance
    models/             - Type interfaces used in app
    app.component       - The app
    app.module.ts       - The root module
    directions-renderer - Wrapper of google.maps.DirectionsRenderer
    directions.service  - Wrapper of google.maps.DirectionsService
  assets/
    icons/              - PWA icons
  environments/         - Enviroments variables for different targets
  google-maps-mocks.ts  - Mock object of google maps for test
  index.html            - App entry point
  karma.conf.js         - Karma config
  manifest.json         - PWA manifest
```

## Installation

1. Run `yarn` to install packages.
2. Replace your Google Maps API key in script tag in **src/index.html**
3. Backend server can configure in src/environments.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

Coverage info can generate to **(./coverage)** after run `ng test`.
![Coverage](./docs/test_coverage.png 'Coverage')