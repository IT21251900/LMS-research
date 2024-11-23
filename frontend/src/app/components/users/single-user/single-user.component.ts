import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

import { CustomBreadcrumbComponent } from '../../common/custom-breadcrumb/custom-breadcrumb.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RolesService } from '../../../core/services/roles.service';

interface ItemData {
  Action: string;
  Details: string;
  Dateandtime: string;
}

@Component({
  selector: 'app-single-user',
  standalone: true,
  imports: [
    CustomBreadcrumbComponent,
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
    NzPopconfirmModule,
  ],
  templateUrl: './single-user.component.html',
  styleUrls: ['./single-user.component.scss'],
})
export class SingleUserComponent implements OnInit {
  breadcrumbs: any[] = [];
  user: any; // User data with role name
  userLog: ItemData[] = []; // For activity log data
  ref: any;

  pageIndex: number = 1;
  pageSize: number = 20;
  searchText: string = '';
  sortField: string = 'createdAt';
  sortOrder: number = -1;
  totalLogs: number = 0;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private rolesService: RolesService,
    private notification: NzNotificationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadUserData();
  }

  setBreadcrumbs(): void {
    this.breadcrumbs = [
      { title: 'Users', route: '/admin/users' },
      {
        title: this.ref ?? 'User Details',
        route: `/admin/users/${this.user._id}`,
      },
    ];
  }

  loadUserData(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userService
        .getOneUserById(userId)
        .then((user) => {
          return this.rolesService.getOneRoleById(user.role).then((role) => ({
            ...user,
            roleName: role.name,
            createdOn: user.createdAt,
          }));
        })
        .then((userWithRole) => {
          this.user = userWithRole;
          this.ref = this.user?.refNo;
          this.setBreadcrumbs();
        })
        .catch((error) => {
          console.error('Error loading user data:', error);
          this.notification.error('Error', 'Failed to load user data.');
        });
    }
  }

  resetUserPassword(email: any): void {
    const payload = {
      email: email,
    };

    this.userService
      .AdminResetPassword(payload)
      .then((response) => {
        this.notification.success(
          'Success',
          "Password reset information sent to user's email.",
        );
      })
      .catch((error) => {
        console.error('Error resetting password:', error);
      });
  }

  editUser(data: any): void {
    this.router.navigate([
      `admin/users/add-edit/${data}`,
      { backLoc: 'single' },
    ]);
  }

  toggleArchive(): void {
    if (!this.user) return;

    const updatedUser = { ...this.user, archived: !this.user.archived };

    this.userService
      .updateUser(updatedUser)
      .then((response) => {
        this.user = response;
        const status = updatedUser.archived ? 'archived' : 'unarchived';
        this.notification.success(
          'Success',
          `User has been ${status} successfully.`,
        );
        this.loadUserData();
      })
      .catch((error) => {
        console.error('Error updating user data:', error);
        this.notification.error('Error', 'Failed to update user data.');
      });
  }

  toggleActive(): void {
    if (!this.user) return;

    const updatedUser = { ...this.user, active: !this.user.active };

    this.userService
      .updateUser(updatedUser)
      .then((response) => {
        this.user = response;
        const status = updatedUser.active ? 'active' : 'inactive';
        this.notification.success(
          'Success',
          `User has been ${status} successfully.`,
        );
        this.loadUserData();
      })
      .catch((error) => {
        console.error('Error updating user data:', error);
        this.notification.error('Error', 'Failed to update user data.');
      });
  }
}
