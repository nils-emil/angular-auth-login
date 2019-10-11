import {AuthService} from '../services/auth.service';
import {Component} from '@angular/core';

@Component({
  styleUrls: ['user-info.component.sass'],
  template: `
      <h1 style="text-align:center">
          User info
      </h1>
      <section class="user-info">
          <table *ngIf="authService.sessionInfo">
              <tr>
                  <td>First name</td>
                  <td>{{authService.sessionInfo.firstName}}</td>
              </tr>
              <tr>
                  <td>Last name</td>
                  <td>{{authService.sessionInfo.lastName}}</td>
              </tr>
              <tr>
                  <td>Id code</td>
                  <td>{{authService.sessionInfo.idCode}}</td>
              </tr>
              <tr>
                  <td>E-mail</td>
                  <td>{{authService.sessionInfo.email}}</td>
              </tr>
              <tr>
                  <td>Birthday</td>
                  <td>{{authService.sessionInfo.birthday | date:'dd/MM/yy'}}</td>
              </tr>
          </table>
          <router-outlet></router-outlet>
      </section>`
})
export class UserInfoComponent {

  constructor(private authService: AuthService) {
  }

}
