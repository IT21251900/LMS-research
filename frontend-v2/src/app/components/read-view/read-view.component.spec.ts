import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadViewComponent } from './read-view.component';

describe('ReadViewComponent', () => {
  let component: ReadViewComponent;
  let fixture: ComponentFixture<ReadViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
