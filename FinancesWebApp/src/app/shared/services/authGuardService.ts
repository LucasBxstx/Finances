import { Injectable } from "@angular/core";
import { CanActivate } from "@angular/router";

@Injectable()
export class AuthGuardService implements CanActivate {  
    public canActivate(): boolean {
        const token = localStorage.getItem('loginToken');
        return token !== null;
    }
}