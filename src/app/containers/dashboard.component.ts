import {AuthService} from '../services/auth.service';
import {Component} from '@angular/core';

@Component({
  styleUrls: ['dashboard.component.sass'],
  template: `
      <header class='header'>
          <ul class='menu'>
              <li><a (click)="logout()">Logout</a></li>
          </ul>
      </header>
      <router-outlet></router-outlet>
  `

})
export class DashboardComponent {
  constructor(private authService: AuthService) {
    this.authService.updateUserInfo();
  }

  logout() {
    this.authService.logout();
  }
}
