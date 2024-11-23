import { Component, OnInit } from '@angular/core';

import { CustomBreadcrumbComponent } from '../common/custom-breadcrumb/custom-breadcrumb.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule, DatePipe } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { Pagination } from '../../core/dto/pagination';
import { UserService } from '../../core/services/user.service';
import { RolesService } from '../../core/services/roles.service';

interface UserData {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  mobilenumber: string;
  active: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  role: { name: string }; // Adjusted for role name
}

interface RoleData {
  _id: string;
  name: string;
  permissions: any[];
}

@Component({
  selector: 'app-users',
  standalone: true,
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    CustomBreadcrumbComponent,
    NzTableModule,
    NzButtonModule,
    NzDropDownModule,
    NzMenuModule,
    NzPopconfirmModule,
    NzIconModule,
    NzTabsModule,
    NzTagModule,
    NzSpinModule,
    NzSelectModule,
    NzCheckboxModule,
    CommonModule,
    FormsModule,
    NzInputModule,
    NzSwitchModule,
    NzPaginationModule,
    NzRadioModule,
  ],
  providers: [DatePipe],
})
export class UsersComponent implements OnInit {
  breadcrumbs: any[] = [];
  listOfData: any[] = [];
  isLoading = false;
  roles: RoleData[] = [];

  filters = {
    searchText: '',
    status: null,
    role: null,
    archived: false,
  };

  pageIndex = 1;
  pageSize = 20;
  total: number = 6;
  sortField = 'createdAt';
  sortOrder: number = -1;

  constructor(
    private userService: UserService,
    private rolesService: RolesService,
    private datePipe: DatePipe,
    private router: Router,
    private notification: NzNotificationService,
  ) {}

  ngOnInit() {
    this.setBreadcrumbs();
    this.loadUsers();
    this.loadRoles();
  }

  setBreadcrumbs(): void {
    this.breadcrumbs = [{ title: 'Users', route: '/admin/users' }];
  }

  loadUsers(): void {
    const payload = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      filters: this.filters,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
    };

    this.isLoading = true;

    this.userService
      .getPagedUsers(payload)
      .then((response) => {
        if (response && response.length > 0 && response[0].data) {
          this.listOfData = response[0].data;
          this.total = response[0].metadata[0].total;
          console.log('Page Index:', this.pageIndex);
          console.log('Page Size:', this.pageSize);
          console.log('Total:', this.total);
          console.log('Response:', response);
        } else {
          this.listOfData = [];
          this.total = 0;
        }
        this.isLoading = false;
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
        this.isLoading = false;
      });
  }

  addUser() {
    this.router.navigate([`admin/users/add-edit`]);
  }

  sort(): void {
    this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    this.loadUsers();
  }

  loadRoles(): void {
    this.rolesService
      .getPagedRoles({ pageIndex: 1, pageSize: 100 })
      .then((response) => {
        this.roles = response[0].data;
        console.log(this.roles);
      })
      .catch((error) => {
        console.error('Error fetching roles:', error);
      });
  }

  applyFilters(newFilters: any): void {
    this.filters = { ...this.filters, ...newFilters };
    this.loadUsers();
  }

  applySort(): void {
    this.loadUsers();
  }

  user: UserData | null = null;

  editUser(data: any): void {
    this.router.navigate([`admin/users/add-edit/${data._id}`]);
  }

  viewSingleUser(data: any): void {
    this.router.navigate([`admin/users/${data}`]);
  }

  resetUserPassword(data: any): void {
    this.userService
      .AdminResetPassword(data)
      .then((response) => {
        this.notification.success(
          'Success',
          'Password reset information sent to users Email.',
        );
      })
      .catch((error) => {
        console.error('Error Reseting password:', error);
      });
  }

  toggleArchive(userId: string): void {
    this.userService
      .getOneUserById(userId)
      .then((user) => {
        if (!user) return;
        const updatedUser = { ...user, archived: !user.archived };

        this.userService
          .updateUser(updatedUser)
          .then((response) => {
            const status = updatedUser.archived ? 'archived' : 'unarchived';
            this.notification.success(
              'Success',
              `User has been ${status} successfully.`,
            );
            this.loadUsers(); // Refresh user list
          })
          .catch((error) => {
            console.error('Error updating user data:', error);
            this.notification.error('Error', 'Failed to update user status.');
          });
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }

  toggleActive(userId: string): void {
    this.userService
      .getOneUserById(userId)
      .then((user) => {
        if (!user) return;
        const updatedUser = { ...user, active: !user.active };

        this.userService
          .updateUser(updatedUser)
          .then((response) => {
            const status = updatedUser.active ? 'activated' : 'deactivated';
            this.notification.success(
              'Success',
              `User has been ${status} successfully.`,
            );
            this.loadUsers(); // Refresh user list
          })
          .catch((error) => {
            console.error('Error updating user data:', error);
            this.notification.error('Error', 'Failed to update user status.');
          });
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });
  }

  // New method to handle Enter key press
  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.applyFilters({ searchText: this.filters.searchText });
    }
  }

  onPageChange(pageIndex: number): void {
    this.pageIndex = pageIndex;
    this.loadUsers();
  }

  onPageSizeChange(pageSize: Number): void {
    this.pageSize = Number(pageSize);
    this.pageIndex = 1; // Reset to the first page when page size changes
    this.loadUsers();
  }
}
