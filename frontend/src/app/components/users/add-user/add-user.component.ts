import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { UserService } from '../../../core/services/user.service';
import { CustomBreadcrumbComponent } from '../../common/custom-breadcrumb/custom-breadcrumb.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import codes from 'country-calling-code';
import { RolesService } from '../../../core/services/roles.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [
    CustomBreadcrumbComponent,
    NzButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzAlertModule,
    NzIconModule,
    CommonModule,
    NzSelectModule,
    NzSwitchModule,
    NzSpinModule
  ],
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss'],
})
export class AddUserComponent implements OnInit {
  breadcrumbs: any[] = [];
  userForm: FormGroup;
  roles: any[] = [];
  userId: string | null = null; // To store the user ID for edit mode
  backLocation: any;
  isLoading : boolean = false;
  countryCodes: { name: string; dialCode: string }[] = [];

  ngOnInit() {
    this.setBreadcrumbs();
    this.loadCountryCodes();
    this.loadRoles();
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id');
      if (this.userId) {
        this.loadUserData(this.userId);
      }
    });
    this.backLocation = this.route.snapshot.paramMap.get('backLoc');
    console.log(this.backLocation);

    if (this.userId) {
      this.userForm.get('email')?.disable();
    }

    if (this.backLocation == 'my-account') {
      this.userForm.get('role')?.disable();
      this.userForm.get('active')?.disable();
    }
  }

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute, // To access route parameters
    private notification: NzNotificationService,
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
      phoneNumberPrefix: [null, [Validators.required]],
      mobilenumber: [
        null,
        [Validators.required, Validators.maxLength(15), this.numericValidator],
      ],
      email: [
        { value: '', disabled: !!this.userId },
        [Validators.required, Validators.email],
      ],
      role: [null, [Validators.required]],
      active: [true],
      // password: ['defaultPassword', [Validators.required]]
    });
  }

  setBreadcrumbs(): void {
    this.breadcrumbs = [
      { title: 'Users', route: '/admin/users' },
      { title: this.userId ? 'Update User' : 'Add User' },
    ];
  }

  loadRoles(): void {
    this.rolesService
      .getRolesForOptions()
      .then((response) => {
        this.roles = response;
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });
  }

  loadCountryCodes() {
    this.countryCodes = codes.map((code) => ({
      name: code.country,
      dialCode: `+${code.countryCodes[0]}`,
    }));
  }
  
  loadUserData(userId: string): void {
    this.isLoading = true;
    this.userService
      .getOneUserById(userId)
      .then((response) => {
        this.userForm.patchValue(response);
        console.log(this.userForm);
        this.setBreadcrumbs();
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error loading user data:', error);
        this.isLoading = false;
      });
  }

  saveUser(): void {
    this.isLoading = true;
    if (this.userForm.valid) {
      const payload = this.userForm.getRawValue(); // getRawValue to include disabled fields
      if (this.userId) {
        this.userService
          .updateUser(payload)
          .then((response) => {
            this.notification.success('Success', 'User updated successfully!');
            if (this.backLocation === 'single') {
              this.router.navigate([`/admin/users/${this.userId}`]);
            } else if (this.backLocation === 'my-account') {
              this.router.navigate([`/admin/my-account/${this.userId}`]);
            } else {
              this.router.navigate(['/admin/users']);
            }
            this.isLoading = false;
          })
          .catch((error) => {
            console.error('Error updating user:', error);
            this.notification.error(
              'Error',
              error.message,
            );
            this.isLoading = false;
          });
      } else {
        this.userService
          .createUser(payload)
          .then((response) => {
            this.notification.success('Success', 'User created successfully!');
            this.router.navigate(['/admin/users']);
            if (this.backLocation === 'single') {
              this.router.navigate([`/admin/users/${this.userId}`]);
            } else if (this.backLocation === 'my-account') {
              this.router.navigate([`/admin/my-account/${this.userId}`]);
            } else {
              this.router.navigate(['/admin/users']);
            }
            this.isLoading = false;
          })
          .catch((error) => {
            console.error('Error creating user:', error);
            this.notification.error(
              'Error',
              error.message,
            );
            this.isLoading = false;
          });
      }
    } else {
      console.log('Form is invalid');
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

  getFirstNameErrorMessage(): string {
    const control = this.userForm.get('firstname');
    if (control?.hasError('required')) {
      return 'Please input your first name!';
    } else if (control?.hasError('maxlength')) {
      return 'First name must be at most 70 characters long!';
    } else if (control?.hasError('lettersOnly')) {
      return 'First name must contain only letters!';
    }
    return '';
  }

  getLastNameErrorMessage(): string {
    const control = this.userForm.get('lastname');
    if (control?.hasError('required')) {
      return 'Please input your last name!';
    } else if (control?.hasError('maxlength')) {
      return 'Last name must be at most 70 characters long!';
    } else if (control?.hasError('lettersOnly')) {
      return 'Last name must contain only letters!';
    }
    return '';
  }

  getMobileNumberErrorMessage(): string {
    const control = this.userForm.get('mobilenumber');
    if (control?.hasError('required')) {
      return 'Please input your mobile number!';
    } else if (control?.hasError('maxlength')) {
      return 'Mobile number must be at most 15 characters long!';
    } else if (control?.hasError('numeric')) {
      return 'Mobile number must contain only numbers!';
    }
    return '';
  }
}
