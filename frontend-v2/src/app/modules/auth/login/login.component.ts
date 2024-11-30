import { Component } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router, RouterLink } from "@angular/router";
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  Validators,
} from "@angular/forms";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzAlertModule } from "ng-zorro-antd/alert";
import { NzIconModule } from "ng-zorro-antd/icon";
import { ActionAlert } from "../../../core/dto/actionAlert";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    NzButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
    NzIconModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent {
  loginForm: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }> = this.fb.group({
    email: ["", [Validators.required]],
    password: ["", [Validators.required]],
  });

  passwordVisible = false;
  btnLoading = false;
  actionMessage = new ActionAlert();

  constructor(
    private authService: AuthService,
    private fb: NonNullableFormBuilder,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(["/home/dashboard"]);
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  navigate(): void {
    this.router.navigate([`/auth/forgot-password`]);
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      // Iterate through form controls to check validity
      const errorMessages: string[] = [];
      Object.keys(this.loginForm.controls).forEach((field) => {
        const control = this.loginForm.get(field);
        control?.markAsTouched({ onlySelf: true });

        if (control?.invalid) {
          // Add specific error messages based on field and validators
          if (field === "email" && control.errors?.["required"]) {
            errorMessages.push("Email is required.");
          }
          if (field === "password" && control.errors?.["required"]) {
            errorMessages.push("Password is required.");
          }
        }
      });

      // Combine messages and display them
      this.actionMessage = {
        display: true,
        type: "error",
        message: errorMessages.join(" "),
      };

      return;
    }

    this.btnLoading = true;
    try {
      console.log(this.loginForm.value);
      const userData = await this.authService.login(this.loginForm.value);
      this.router.navigate(["/admin"]);
    } catch (e: any) {
      this.actionMessage = {
        display: true,
        type: "error",
        message: e.message || "Login failed. Please try again.",
      };
    } finally {
      this.btnLoading = false;
    }
  }
}
