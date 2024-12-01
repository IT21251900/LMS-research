import { Component, HostListener } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ReadViewComponent } from '../../components/read-view/read-view.component';

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NzLayoutModule, NzTypographyModule, NzButtonModule, NzIconModule, ReadViewComponent],
  templateUrl: './main-dashboard.component.html',
  styleUrls: ['./main-dashboard.component.scss']
})
export class MainDashboardComponent {
  sidebarWidth = 800; // Initial width of the sidebar
  splitViewEnabled = true; // Track if the split view is enabled
  showFirstPanel = true; // Track visibility of the first panel
  showSecondPanel = true; // Track visibility of the second panel
  isDragging = false; // Track if the user is dragging
  initialMouseX = 0; // Store the initial mouse position during drag
  title = 'miStudy';
  constructor(
    public router: Router,
  ){}
  // Toggle the split view on/off
  toggleSplitView(): void {
    this.splitViewEnabled = !this.splitViewEnabled;
    this.routeLink('notes');
  }

  // Toggle the visibility of either the first or second panel
  togglePanelVisibility(panel: 'first' | 'second'): void {
    if (panel === 'first') {
      this.showFirstPanel = !this.showFirstPanel;
    } else if (panel === 'second') {
      this.showSecondPanel = !this.showSecondPanel;
    }
  }

  // When the mouse is pressed down, start dragging
  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.initialMouseX = event.clientX; // Store the initial position
    document.body.style.userSelect = 'none'; // Disable text selection during drag
  }

  // When mouse is moving, update sidebar width
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = event.clientX - this.initialMouseX; // Calculate the difference in X position
      this.sidebarWidth = Math.max(400, Math.min(this.sidebarWidth + deltaX, 1800)); // Constrain the width between 200px and 400px
      this.initialMouseX = event.clientX; // Update the initial mouse position for the next move
    }
  }

  // When the mouse is released, stop dragging
  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    document.body.style.userSelect = ''; // Re-enable text selection
  }

  routeLink(type: string) {
    switch (type) {
      case 'notes':
        this.router.navigate(['/home/dashboard/notes']);
        break;
      case 'mindmap-generator':
        this.router.navigate(['/home/dashboard/mindmap-generator']);
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
