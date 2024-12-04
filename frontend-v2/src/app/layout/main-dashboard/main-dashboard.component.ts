import { Component, HostListener } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { CommonModule } from "@angular/common"; // Import CommonModule
import { NzLayoutModule } from "ng-zorro-antd/layout";
import { NzTypographyModule } from "ng-zorro-antd/typography";
import { NzButtonModule } from "ng-zorro-antd/button";
import { NzIconModule } from "ng-zorro-antd/icon";
import { ReadViewComponent } from "../../components/read-view/read-view.component";

@Component({
  selector: "app-main-dashboard",
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    NzLayoutModule,
    NzTypographyModule,
    NzButtonModule,
    NzIconModule,
    ReadViewComponent,
  ],
  templateUrl: "./main-dashboard.component.html",
  styleUrls: ["./main-dashboard.component.scss"],
})
export class MainDashboardComponent {
  sidebarWidth = 800;
  splitViewEnabled = false;
  showFirstPanel = true;
  showSecondPanel = true; 
  isDragging = false; 
  initialMouseX = 0; 
  title = "miStudy";
  constructor(public router: Router) {}

  toggleSplitView(): void {
    this.splitViewEnabled = !this.splitViewEnabled;
    this.routeLink("notes");
  }

  togglePanelVisibility(panel: "first" | "second"): void {
    if (panel === "first") {
      this.showFirstPanel = !this.showFirstPanel;
    } else if (panel === "second") {
      this.showSecondPanel = !this.showSecondPanel;
    }
  }

  onMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.initialMouseX = event.clientX; 
    document.body.style.userSelect = "none"; 
  }

  @HostListener("document:mousemove", ["$event"])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      const deltaX = event.clientX - this.initialMouseX; 
      this.sidebarWidth = Math.max(
        400,
        Math.min(this.sidebarWidth + deltaX, 1800)
      ); 
      this.initialMouseX = event.clientX; 
    }
  }

  @HostListener("document:mouseup")
  onMouseUp(): void {
    this.isDragging = false;
    document.body.style.userSelect = ""; 
  }

  routeLink(type: string) {
    switch (type) {
      case "notes":
        this.router.navigate(["/home/dashboard/notes"]);
        break;
      case "mindmap-generator":
        this.router.navigate(["/home/dashboard/mindmap-generator"]);
        break;
      case "simple-auto-mindmap-generator":
        this.router.navigate(["/home/dashboard/simple-auto-mindmap-generator"]);
        break;
      case "chapters":
        this.router.navigate(["/home/dashboard/chapters"]);
        break;
      case "quizzes":
        this.togglePanelVisibility('first')
        this.router.navigate(["/home/dashboard/quizzes"]);
        break;
      case "roles":
        this.router.navigate(["/admin/roles"]);
        break;
      case "roles-add":
        this.router.navigate(["/admin/roles/add-edit"]);
        break;
    }
  }
}
