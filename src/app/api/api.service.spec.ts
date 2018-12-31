import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReplaySubject, of } from 'rxjs';

import { ApiService } from './api.service';
import { SubmitRouteResponse } from './dto';

import { environment } from '../../environments/environment';

const TOKEN = '9d3503e0-7236-4e47-a62f-8b01b5646c16';
const ERROR_500_TEXT = 'Internal Server Error';
const SUCCESS_RESPONSE = {
  status: 'success',
  path: [
    ['0', '0'],
    ['1', '1']
  ],
  total_distance: 1000,
  total_time: 100
};
const INPROGRESS_RESPONSE = {
  status: 'in progress'
};
const FAIL_RESPONSE = {
  status: 'failure',
  error: 'Location not accessible by car'
};

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    }).compileComponents();

    service = TestBed.get(ApiService);
    httpMock = TestBed.get(HttpTestingController);
    http = TestBed.get(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#submitRoute', () => {
    it('should get token', done => {
      service.submitRoute({
        // mock api don't care route content
        route: [
          ['0', '0'],
          ['1', '1']
        ]
      })
        .subscribe(res => {
          expect(res.token).toBeTruthy();
          expect(typeof (res.token)).toBe('string');
          done();
        });

      const mockResponse: SubmitRouteResponse = {
        token: TOKEN
      };
      httpMock.expectOne({
        url: `${environment.apiServer}/route`,
        method: 'POST'
      }).flush(mockResponse);
    });

    it('should get error if service not available', done => {
      service.submitRoute({
        // mock api don't care route content
        route: [
          ['0', '0'],
          ['1', '1']
        ]
      })
        .subscribe(null, error => {
          expect(error.status).toBe(500);
          done();
        });

      httpMock.expectOne({
        url: `${environment.apiServer}/route`,
        method: 'POST'
      }).flush(ERROR_500_TEXT, { status: 500, statusText: ERROR_500_TEXT });
    })
  });

  describe('#getRoute', () => {
    it('should get path', done => {
      service.getRoute(TOKEN)
        .subscribe(res => {
          expect(res.status).toBe('success');
          expect(Array.isArray(res.path)).toBeTruthy();
          expect(typeof res.total_time).toBe('number');
          expect(typeof res.total_distance).toBe('number');
          done();
        });

      httpMock.expectOne({
        url: `${environment.apiServer}/route/${TOKEN}`,
        method: 'GET'
      }).flush(SUCCESS_RESPONSE);
    });

    it('should get error if service not available', done => {
      service.getRoute(TOKEN)
        .subscribe(null, error => {
          expect(error.status).toBe(500);
          done();
        });

      httpMock.expectOne({
        url: `${environment.apiServer}/route/${TOKEN}`,
        method: 'GET'
      }).flush(ERROR_500_TEXT, { status: 500, statusText: ERROR_500_TEXT });
    })

    it('should get error if location not accessible', done => {
      service.getRoute(TOKEN)
        .subscribe(null, error => {
          expect(error.error).toBe('Location not accessible by car');
          done();
        });

      httpMock.expectOne({
        url: `${environment.apiServer}/route/${TOKEN}`,
        method: 'GET'
      }).flush(FAIL_RESPONSE);
    });

    it('should retry once and get path if first response is in progress', fakeAsync(() => {
      const response$ = new ReplaySubject(1);
      spyOn(http, 'get').and.returnValue(response$);

      let result;
      service.getRoute(TOKEN)
        .subscribe(res => result = res);

      response$.next(INPROGRESS_RESPONSE);
      response$.next(SUCCESS_RESPONSE);
      tick(500);
      expect(result.status).toBe('success');
    }));

    it('should get error if status still return in progress after request 20 times', fakeAsync(() => {
      const response$ = new ReplaySubject(1);
      const sendResponse = () => {
        response$.next(INPROGRESS_RESPONSE);
        tick(500);
      };
      spyOn(http, 'get').and.returnValue(response$);

      let result;
      service.getRoute(TOKEN)
        .subscribe(null, error => result = error);

      // send response 19 times, result should not ready
      for (let i = 0; i < 19; i++) {
        sendResponse();
      }
      expect(result).toBeUndefined();

      // send the 20th time, should got result
      sendResponse();
      expect(result.error).toBe('Route is still not ready, you can try again.');
    }));
  });

  describe('#getDrivingRoute', () => {
    it('should get path', done => {
      spyOn(service, 'submitRoute').and.returnValue(of(TOKEN));
      spyOn(service, 'getRoute').and.returnValue(of(SUCCESS_RESPONSE));

      service.getDrivingRoute([
        { description: '', geometry: { location: { lat: () => 0, lng: () => 0 } } as any },
        { description: '', geometry: { location: { lat: () => 1, lng: () => 0 } } as any }
      ])
        .subscribe(res => {
          expect(res.status).toBe('success');
          done();
        });
    })
  });
});
