import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';

@Component({
  styleUrls: ['registration.component.sass'],
  template: `
      <section class="registration">
          <h1 class="registration-header">
              Register account
          </h1>
          <form [formGroup]="loginForm" (ngSubmit)="register()">
              <label>
                  First name
                  <input class="form-input" type="text" formControlName="firstName">
              </label>
              <p *ngIf="isSubmitted && formControls.firstName.errors && formControls.firstName.errors.required"
                 class="has-error">
                  First name is required
              </p>
              <label>
                  Last name
                  <input class="form-input" type="text" formControlName="lastName">
              </label>
              <p *ngIf="isSubmitted && formControls.lastName.errors && formControls.lastName.errors.required"
                 class="has-error">
                  Last name is required
              </p>
              <label>
                  Id code
                  <input class="form-input" type="text" formControlName="idCode">
              </label>
              <p *ngIf="isSubmitted && formControls.idCode.errors && formControls.idCode.errors.required"
                 class="has-error">
                  Id code is required
              </p>
              <label>
                  Password
                  <input class="form-input" type="password" formControlName="password">
              </label>
              <p *ngIf="isSubmitted && formControls.password.errors && formControls.password.errors.required"
                 class="has-error">
                  Password is required
              </p>
              <label>
                  E-mail
                  <input class="form-input" type="email" formControlName="email">
              </label>
              <p *ngIf="isSubmitted && formControls.email.errors "
                 class="has-error">
                  Correct e-mail is required
              </p>
              <label>
                  Birthday
                  <input class="form-input" type="date" formControlName="birthday">
              </label>
              <p class="has-error"
                 *ngIf="isSubmitted && formControls.birthday.errors && formControls.birthday.errors.required">
                  Birthday is required
              </p>
              <div class="pt-1-rem">
                  <p *ngIf="submitSuccessFull">Registration successful</p>
                  <p *ngIf="errorMessage" class="has-error">{{errorMessage}}</p>
              </div>
              <input class="btn-submit" type="submit" value="Register account">
              <div class="pt-1-rem">
                  <a [routerLink]="['/login']">Login with existing account</a>
              </div>
          </form>
      </section>`
})
export class RegistrationComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitted = false;
  submitSuccessFull = false;
  errorMessage: string;

  constructor(private authService: AuthService, private formBuilder: FormBuilder) {
  }

  get formControls() {
    return this.loginForm.controls;
  }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      idCode: ['', Validators.required],
      password: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', Validators.required]
    });
  }

  register(): void {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    this.authService.registerNewUser(this.loginForm.value)
      .subscribe(() => {
          this.loginForm.reset();
          this.isSubmitted = false;
          this.submitSuccessFull = true;
          delete this.errorMessage;
        },
        error => {
          this.errorMessage = error.error.message;
          this.submitSuccessFull = false;
        });
  }


}
