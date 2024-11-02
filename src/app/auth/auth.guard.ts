import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; 

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate 
{

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) { // Método para verificar autenticación
      return true; // Permitir acceso si el usuario está autenticado
    } else {
      this.router.navigate(['/inicio']); // Redirigir al login si no está autenticado
      return false; // Bloquear el acceso
    }
  }


  
}


/*  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
*/  



