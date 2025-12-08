import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrestationCardComponent } from './prestation-card.component';

describe('PrestationCardComponent', () => {
  let component: PrestationCardComponent;
  let fixture: ComponentFixture<PrestationCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrestationCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrestationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
