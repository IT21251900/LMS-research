import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSubMenuComponent } from 'ng-zorro-antd/menu';
import { NzAnchorModule } from 'ng-zorro-antd/anchor';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { EncryptionService } from '../../core/services/encryption.service';
import { SETTINGS } from '../../core/config/common.settings';
import { AuthService } from '../../modules/auth/services/auth.service';
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NzButtonModule,
    NzLayoutModule,
    NzBreadCrumbModule,
    NzIconModule,
    NzMenuModule,
    NzDropDownModule,
    NzSubMenuComponent,
    CommonModule,
    NzAnchorModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent implements OnInit {
  isCollapsed = false;
  routerLink = '';
  openSubmenu: number | null = null;
  loggedInUserName: string | null = null;
  loggedInUserRole: string | null = null;
  loggedInUserID: string | null = null;

  private encryption = new EncryptionService(); 

  ngOnInit(): void {
    this.loadLoggedInUser();
  }

  constructor(
    public router: Router,
    private authService: AuthService,
  ) {}
  toggleSubmenu(submenu: number, open: boolean): void {
    this.openSubmenu = open ? submenu : null;
  }

  loadLoggedInUser(): void {
    const encryptedUserStr = localStorage.getItem(SETTINGS.LOGGED_IN_USER);

    if (encryptedUserStr) {
      const userStr = this.encryption.decrypt(encryptedUserStr);
      const user = JSON.parse(userStr);
      this.loggedInUserName = user.firstname + ' ' + user.lastname;
      this.loggedInUserRole = user.role.name;
      this.loggedInUserID = user.userId;
    }
  }

  async logout(): Promise<any> {
    await this.authService.logout();
  }

  viewMyAccount(data: any): void {
    this.router.navigate([`admin/my-account/${data}`]);
  }

  routeLink(type: string) {
    switch (type) {
      case 'users':
        this.router.navigate(['/admin/users']);
        break;
      case 'user-add':
        this.router.navigate(['/admin/users/add-edit']);
        break;
      case 'roles':
        this.router.navigate(['/admin/roles']);
        break;
      case 'roles-add':
        this.router.navigate(['/admin/roles/add-edit']);
        break;
    }
  }
}
