import { Routes } from '@angular/router';
import {AdminLayoutComponent} from "./layout/admin-layout/admin-layout.component";
import {AuthGuard} from "./core/guards/auth.guard";
import {UsersComponent} from "./components/users/users.component";
import {AddUserComponent} from "./components/users/add-user/add-user.component";
import { SingleUserComponent } from './components/users/single-user/single-user.component';
import { MyAcountComponent } from './components/users/my-acount/my-acount.component';
import { MindmapGeneratorComponent } from './components/mindmap-generator/mindmap-generator.component';
import { MainDashboardComponent } from './layout/main-dashboard/main-dashboard.component';
import { NotesViewComponent } from './components/notes-view/notes-view.component';
import { SimpleMindMapGeneratorComponent } from './components/simple-mindmap-generator/simple-mindmap-generator';
import { HomeComponent } from './components/home/home.component';
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
    path: 'home',
    component: AdminLayoutComponent,
    // canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'dashboard',
        component: MainDashboardComponent,
        children: [
          {
            path: '',
            redirectTo: 'home/dashboard/users',
            pathMatch: 'full',
          },
          {
            path: 'notes',
            component: NotesViewComponent,
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
          {
            path: 'mindmap-generator/:id',
            component: MindmapGeneratorComponent,
          },
          {
            path: 'simple-auto-mindmap-generator',
            component: SimpleMindMapGeneratorComponent ,
          },
        ]
      },
     
    ]
  }
];
