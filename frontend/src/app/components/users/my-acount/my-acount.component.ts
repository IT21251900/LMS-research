import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonComponent, NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CustomBreadcrumbComponent } from '../../common/custom-breadcrumb/custom-breadcrumb.component';

import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RolesService } from '../../../core/services/roles.service';
@Component({
  selector: 'app-my-acount',
  standalone: true,
  imports: [
    CustomBreadcrumbComponent,
    NzButtonComponent,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzAlertModule,
    NzIconModule,
    CommonModule,
    NzSelectModule,
    NzSwitchModule,
    NzDropDownModule,
    NzTableModule,
  ],
  templateUrl: './my-acount.component.html',
  styleUrls: ['./my-acount.component.scss'],
})
export class MyAcountComponent implements OnInit {
  passwordVisibleOld: boolean = false;
  passwordVisibleNew: boolean = false;
  passwordVisibleConfirm: boolean = false;
  changePasswordForm: FormGroup;
  userId: string | null = null;
  user: any;

  breadcrumbs: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RolesService,
    private notification: NzNotificationService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.changePasswordForm = this.fb.group(
      {
        oldPassword: [null, [Validators.required]],
        password: [
          null,
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            ),
          ],
        ],
        confirmPassword: [null, [Validators.required]],
      },
      {
        validator: this.passwordMatchValidator,
      },
    );
  }

  ngOnInit() {
    this.setBreadcrumbs();
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.loadUserData();
    }
  }

  setBreadcrumbs(): void {
    this.breadcrumbs = [
      {
        title: `My Account`,
        route: '/admin/my-account',
      },
    ];
  }

  togglePasswordVisibilityOld(): void {
    this.passwordVisibleOld = !this.passwordVisibleOld;
  }

  togglePasswordVisibilityNew(): void {
    this.passwordVisibleNew = !this.passwordVisibleNew;
  }

  togglePasswordVisibilityConfirm(): void {
    this.passwordVisibleConfirm = !this.passwordVisibleConfirm;
  }

  passwordMatchValidator(
    formGroup: FormGroup,
  ): { [key: string]: boolean } | null {
    if (
      formGroup.get('password')?.value !==
      formGroup.get('confirmPassword')?.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  submitChangePassword(): void {
    if (this.changePasswordForm.valid && this.userId) {
      const formValue = this.changePasswordForm.value;
      const payload = {
        id: this.userId,
        oldPassword: formValue.oldPassword,
        password: formValue.password,
      };

      this.userService
        .changePassword(payload)
        .then((response) => {
          if (response.oldPwdCheck) {
            this.notification.error(
              'Error',
              response.message || 'Failed to change password.',
            );
          } else {
            this.notification.success(
              'Success',
              'Password changed successfully.',
            );
            this.changePasswordForm.reset();
          }
        })
        .catch((error) => {
          this.notification.error(
            'Error',
            error.message || 'Failed to change password.',
          );
        });
    } else if (this.changePasswordForm.hasError('passwordMismatch')) {
      this.notification.error('Error', 'Passwords do not match.');
    } else {
      this.notification.error('Error', 'User ID not found or form is invalid.');
    }
  }

  editUser(data: any): void {
    this.router.navigate([
      `admin/users/add-edit/${data}`,
      { backLoc: 'my-account' },
    ]);
  }

  loadUserData(): void {
    if (this.userId) {
      this.userService
        .getOneUserById(this.userId)
        .then((user) => {
          return this.roleService.getOneRoleById(user.role).then((role) => ({
            ...user,
            roleName: role.name,
            createdOn: user.createdAt,
          }));
        })
        .then((userWithRole) => {
          this.user = userWithRole;
        })
        .catch((error) => {
          console.error('Error loading user data:', error);
          this.notification.error('Error', 'Failed to load user data.');
        });
    }
  }
}
