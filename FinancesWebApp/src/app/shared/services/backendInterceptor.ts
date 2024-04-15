import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class BackendInterceptor implements HttpInterceptor {

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = localStorage.getItem('loginToken');

        if (token) {
            console.log("token from local storage: ", token);
            const authHeader = `Bearer ${token}`;
            request = request.clone({
                setHeaders: {
                    Authorization: authHeader
                }
            });
        }

        return next.handle(request);
    }

}