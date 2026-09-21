import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  try {
    const user = JSON.parse(userStr || '{}');
    if (user.role !== 'Admin') {
      router.navigate(['/']);
      return false;
    }
    return true;
  } catch {
    router.navigate(['/']);
    return false;
  }
};
