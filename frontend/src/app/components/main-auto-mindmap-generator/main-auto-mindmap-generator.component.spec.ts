import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAutoMindmapGeneratorComponent } from './main-auto-mindmap-generator.component';

describe('MainAutoMindmapGeneratorComponent', () => {
  let component: MainAutoMindmapGeneratorComponent;
  let fixture: ComponentFixture<MainAutoMindmapGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainAutoMindmapGeneratorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MainAutoMindmapGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
