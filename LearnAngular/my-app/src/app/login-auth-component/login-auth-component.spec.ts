import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginAuthComponent } from './login-auth-component';
import { AuthService } from '../services/auth-service';

describe('LoginAuthComponent', () => {
  let component: LoginAuthComponent;
  let fixture: ComponentFixture<LoginAuthComponent>;
  const authService: Pick<AuthService, 'login' | 'restoreSession' | 'logout'> = {
    login: () => of({
      message: 'Login successful!',
      user: { username: 'test@example.com' },
      accessToken: 'test-token',
      tokenType: 'Bearer',
      expiresAt: new Date().toISOString(),
    }),
    restoreSession: () => of({ user: null }),
    logout: () => of(void 0),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginAuthComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: { get: () => null } } } },
        { provide: Router, useValue: { navigateByUrl: () => Promise.resolve(true) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should restore a user session from a bearer token', () => {
    authService.restoreSession = () => of({
      user: { username: 'remembered@example.com' },
    });

    fixture = TestBed.createComponent(LoginAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.email()).toBe('remembered@example.com');
  });
});
