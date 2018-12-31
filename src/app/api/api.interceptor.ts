import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError, concat } from 'rxjs';
import { retryWhen, flatMap, delay, take } from 'rxjs/operators';

/**
 * Handle every http call
 */
export class ApiInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req)
      // retry 3 times if got 500 error
      .pipe(retryWhen(error => error
        .pipe(
          flatMap(e => {
            if (e instanceof HttpErrorResponse && e.status === 500) {
              console.log(`Retrying request ${req.url}...`);
              return of(e).pipe(delay(1000));
            }

            return throwError(e);
          }),
          take(3),
          o => concat(o, throwError({ error: 'Service temporarily not available.' }))
        )
      ));
  }

}
