import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-custom-breadcrumb',
  template: `
    <nz-breadcrumb class="my-3">
      <nz-breadcrumb-item>
        <span nz-icon nzType="home"></span>
      </nz-breadcrumb-item>
      <nz-breadcrumb-item *ngFor="let crumb of crumbs; last as isLast">
        <a *ngIf="!isLast" [routerLink]="crumb.route">
          <span nz-icon [nzType]="crumb?.icon"></span>
          <span>{{ crumb?.title }}</span>
        </a>
        <span *ngIf="isLast">{{ crumb?.title }}</span>
      </nz-breadcrumb-item>
    </nz-breadcrumb>
  `,
  styles: [`
    .my-3 {
      margin: 1rem 0;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzBreadCrumbModule,
    NzIconModule
  ]
})
export class CustomBreadcrumbComponent {
  @Input() crumbs: any[] = [];
}
