import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: { navigate: () => {} } } // Mock Router
      ]
    });
    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true if token exists', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue('some-token');
    expect(guard.canActivate(null as any, null as any)).toBeTrue();
  });

  it('should navigate to login if token does not exist', () => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOn(router, 'navigate');
    expect(guard.canActivate(null as any, null as any)).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
