import { Routes } from '@angular/router';
import {AdminLayoutComponent} from "./layout/admin-layout/admin-layout.component";
import {AuthGuard} from "./core/guards/auth.guard";
import {UsersComponent} from "./components/users/users.component";
import {AddUserComponent} from "./components/users/add-user/add-user.component";
import { SingleUserComponent } from './components/users/single-user/single-user.component';
import { MyAcountComponent } from './components/users/my-acount/my-acount.component';
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  // App Components
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: '/admin/users',
        pathMatch: 'full',
      },
      {
        path: 'users',
        component: UsersComponent,
      },
      {
        path: 'users/add-edit',
        component: AddUserComponent,
      },
      {
        path: 'users/:id',
        component: SingleUserComponent,
      },
      {
        path: 'my-account/:id',
        component: MyAcountComponent,
      },
    ]
  }
];
