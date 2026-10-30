import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

@Component({
  selector: 'app-login-auth-component',
  standalone: false,
  templateUrl: './login-auth-component.html',
  styleUrl: './login-auth-component.css',
})
export class LoginAuthComponent implements OnInit {
  email = signal('');
  password = signal('');
  message = signal('');
  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.authService.restoreSession().subscribe({
      next: (response) => {
        if (response.user) {
          this.email.set(response.user.username);
          this.message.set('Bearer-token session restored.');
          this.returnToRequestedRoute();
        }
      },
      error: () => this.message.set('Session expired. Please log in again.')
    });
  }
  onLogin() {
    const payload = {
      username: this.email(),
      password: this.password()
    };
    this.authService.login(payload).subscribe({
      next: (res) => {
        this.message.set(res.message);
        this.password.set('');
        this.returnToRequestedRoute();
      },
      error: () => {
        this.message.set('Invalid username or password!');
      }
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => this.message.set('Logged out.'),
      error: () => this.message.set('Could not log out. Please try again.')
    });
  }

  private returnToRequestedRoute(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl?.startsWith('/') && !returnUrl.startsWith('//')) {
      void this.router.navigateByUrl(returnUrl);
    }
  }
}
