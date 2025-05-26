import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  // Ne pas modifier les requêtes vers d'autres domaines
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // Si un token existe, l'ajouter aux en-têtes de la requête
  if (authToken) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
