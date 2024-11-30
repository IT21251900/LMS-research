import { Component } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { NzButtonComponent } from "ng-zorro-antd/button";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NzFormModule } from "ng-zorro-antd/form";
import { NzInputModule } from "ng-zorro-antd/input";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzAlertModule } from "ng-zorro-antd/alert";
import { NzIconModule } from "ng-zorro-antd/icon";
import { CommonModule } from "@angular/common";
import { UserService } from "../../../core/services/user.service";
import { NzNotificationService } from "ng-zorro-antd/notification";

@Component({
  selector: "app-sign-up",
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
  ],
  templateUrl: "./sign-up.component.html",
  styleUrl: "./sign-up.component.scss",
})
export class SignUpComponent {
  userForm: FormGroup;
  backLocation: any;
  isLoading: boolean = false;
  countryCodes: { name: string; dialCode: string }[] = [];
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private notification: NzNotificationService
  ) {
    this.userForm = this.fb.group({
      _id: [null],
      firstname: [
        null,
        [
          Validators.required,
          Validators.maxLength(70),
          this.lettersOnlyValidator,
        ],
      ],
      lastname: [
        null,
        [
          Validators.required,
          Validators.maxLength(70),
          this.lettersOnlyValidator,
        ],
      ],
      // phoneNumberPrefix: [null, [Validators.required]],
      // mobilenumber: [
      //   null,
      //   [Validators.required, Validators.maxLength(15), this.numericValidator],
      // ],
      email: [null, [Validators.required, Validators.email]],
      active: [true],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
          ),
        ],
      ],
      confirmPassword: [null, [Validators.required]],
    });
  }

  saveUser(): void {
    this.isLoading = true;
    if (this.userForm.valid) {
      const payload = this.userForm.getRawValue();
      this.userService
        .createUser(payload)
        .then((response) => {
          this.notification.success("Success", "User created successfully!");
          this.router.navigate(["/admin/users"]);
          if (this.backLocation === "single") {
            this.router.navigate([`/admin/users`]);
          } else if (this.backLocation === "my-account") {
            this.router.navigate([`/admin/my-account`]);
          } else {
            this.router.navigate(["/admin/users"]);
          }
          this.isLoading = false;
        })
        .catch((error) => {
          console.error("Error creating user:", error);
          this.notification.error("Error", error.message);
          this.isLoading = false;
        });
    } else {
      console.log("Form is invalid");
      this.isLoading = false;
    }
  }

  lettersOnlyValidator(control: AbstractControl): ValidationErrors | null {
    const valid = /^[a-zA-Z]+$/.test(control.value);
    return valid ? null : { lettersOnly: true };
  }

  numericValidator(control: AbstractControl): ValidationErrors | null {
    const valid = /^\d+$/.test(control.value);
    return valid ? null : { numeric: true };
  }

  passwordMatchValidator(
    formGroup: FormGroup
  ): { [key: string]: boolean } | null {
    if (
      formGroup.get("password")?.value !==
      formGroup.get("confirmPassword")?.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  getFirstNameErrorMessage(): string {
    const control = this.userForm.get("firstname");
    if (control?.hasError("required")) {
      return "Please input your first name!";
    } else if (control?.hasError("maxlength")) {
      return "First name must be at most 70 characters long!";
    } else if (control?.hasError("lettersOnly")) {
      return "First name must contain only letters!";
    }
    return "";
  }

  getLastNameErrorMessage(): string {
    const control = this.userForm.get("lastname");
    if (control?.hasError("required")) {
      return "Please input your last name!";
    } else if (control?.hasError("maxlength")) {
      return "Last name must be at most 70 characters long!";
    } else if (control?.hasError("lettersOnly")) {
      return "Last name must contain only letters!";
    }
    return "";
  }

  getMobileNumberErrorMessage(): string {
    const control = this.userForm.get("mobilenumber");
    if (control?.hasError("required")) {
      return "Please input your mobile number!";
    } else if (control?.hasError("maxlength")) {
      return "Mobile number must be at most 15 characters long!";
    } else if (control?.hasError("numeric")) {
      return "Mobile number must contain only numbers!";
    }
    return "";
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }
}
