import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cif } from './cif';

describe('Cif', () => {
  let component: Cif;
  let fixture: ComponentFixture<Cif>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cif]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cif);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
