import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MindmapGeneratorComponent } from './mindmap-generator.component';

describe('MindmapGeneratorComponent', () => {
  let component: MindmapGeneratorComponent;
  let fixture: ComponentFixture<MindmapGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MindmapGeneratorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MindmapGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
