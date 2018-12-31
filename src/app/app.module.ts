import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatButtonModule, MatInputModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule } from '@angular/material';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppComponent } from './app.component';
import { ControlsComponent } from './controls/controls.component';
import { MapComponent } from './map/map.component';
import { LocationInputDirective } from './location-input/location-input.directive';
import { ApiInterceptor } from './api/api.interceptor';

import { environment } from '../environments/environment';

/**
 * The root module
 */
@NgModule({
  declarations: [
    AppComponent,
    ControlsComponent,
    MapComponent,
    LocationInputDirective
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
