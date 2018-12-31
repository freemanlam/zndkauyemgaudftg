import { HTTP_INTERCEPTORS, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';

import { ApiInterceptor } from './api.interceptor';

const URL = 'http://localhost/';
const SUCCESS_RESPONSE = { result: 'success' };
const SUCCESS_PARAMS = { status: 200, statusText: 'OK' };
const ERROR_404_RESPONSE = null;
const ERROR_404_PARAMS = { status: 404, statusText: 'Not found' };
const ERROR_500_RESPONSE = null;
const ERROR_500_PARAMS = { status: 500, statusText: 'Internal Server Error' };

describe(`ApiInterceptor`, () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ApiInterceptor,
          multi: true,
        },
      ],
    });

    httpMock = TestBed.get(HttpTestingController);
    http = TestBed.get(HttpClient);
  });

  it('should send requests and response data', done => {
    http.get<{ result: string; }>(URL)
      .subscribe(res => {
        expect(res.result).toBe('success');
        done();
      }, () => {
        fail('expect request not error');
      });

    httpMock.expectOne(URL).flush(SUCCESS_RESPONSE);
  });

  it('should get error if response 404', done => {
    http.get(URL)
      .subscribe(() => {
        fail('expect request not success');
      }, (error: HttpErrorResponse) => {
        expect(error.status).toBe(404);
        done();
      });

    httpMock.expectOne(URL).flush(ERROR_404_RESPONSE, ERROR_404_PARAMS);
  });

  it('should retry once if response 500', fakeAsync(() => {
    http.get<{ result: string; }>(URL)
      .subscribe(
        res => expect(res.result).toBe(SUCCESS_RESPONSE.result),
        () => fail('expect request not error')
      );

    let request: TestRequest;
    const responses = [
      [ERROR_500_RESPONSE, ERROR_500_PARAMS],
      [SUCCESS_RESPONSE, SUCCESS_PARAMS],
    ];
    responses.forEach(r => {
      request = httpMock.expectOne(URL);
      request.flush(r[0], r[1]);
      tick(1000);
    });
  }));

  it('should get error if response 500 on 3th time', fakeAsync(() => {
    http.get<{ result: string; }>(URL)
      .subscribe(
        () => fail('expect request not success'),
        error => expect(error.error).toBe('Service temporarily not available.')
      );

    let request: TestRequest;
    for (let i = 0; i < 3; i++) {
      request = httpMock.expectOne(URL);
      request.flush(ERROR_500_RESPONSE, ERROR_500_PARAMS);
      tick(1000);
    }
  }));
});
