import {AuthService} from '../services/auth.service';
import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  styleUrls: ['login.component.sass'],
  template: `
      <section class="login">
          <h1 class="pt-1-rem" style="text-align:center">
              Log in
          </h1>
          <form [formGroup]="loginForm" class="login-container" (ngSubmit)="login()">
              <label>
                  Username
                  <input class="form-input" type="text" formControlName="username">
              </label>
              <p *ngIf="isSubmitted && formControls.username.errors && formControls.username.errors.required"
                 class="has-error">
                  Username required
              </p>
              <label>
                  Password
                  <input type="password" class="form-input" formControlName="password">
              </label>
              <p *ngIf="isSubmitted && formControls.password.errors && formControls.password.errors.required"
                 class="has-error">
                  Password is required
              </p>
              <p class="login-error-message" *ngIf="authService.loginAttemptFailed">Login failed</p>
              <input class="btn-submit" type="submit" value="Log in">
              <div class="pt-1-rem">
                  <a [routerLink]="['/register']"> Register new account</a>
              </div>
          </form>
      </section>`
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitted = false;

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {
  }

  get formControls() {
    return this.loginForm.controls;
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.authService.login(this.loginForm.value);
  }

}
