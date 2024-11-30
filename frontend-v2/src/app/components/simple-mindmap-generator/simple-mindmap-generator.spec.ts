import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleMindMapGeneratorComponent } from './simple-mindmap-generator';

describe('SimpleMindMapGeneratorComponent', () => {
  let component: SimpleMindMapGeneratorComponent;
  let fixture: ComponentFixture<SimpleMindMapGeneratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleMindMapGeneratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleMindMapGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
