import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';

import {RouterModule} from '@angular/router';
import {LoginComponent} from './pages/login.component';
import {RegistrationComponent} from './pages/registration.component';
import {UserInfoComponent} from './pages/user-info.component';
import {TokenInterceptor} from './interceptors/token.interceptor';
import {AuthService} from './services/auth.service';
import {AuthGuardService} from './guards/auth-guard.service';
import {DashboardComponent} from './containers/dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserInfoComponent,
    RegistrationComponent,
    DashboardComponent,
  ],
  providers: [
    AuthGuardService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    }],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot([
      {path: 'login', component: LoginComponent},
      {path: 'register', component: RegistrationComponent},
      {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuardService],
        children: [
          {path: '', component: UserInfoComponent}
        ]
      },
    ])
  ],
  bootstrap: [AppComponent],

})
export class AppModule {
}
