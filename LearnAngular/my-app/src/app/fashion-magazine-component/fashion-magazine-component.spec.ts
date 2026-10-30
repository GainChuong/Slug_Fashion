import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FashionMagazineComponent } from './fashion-magazine-component';

describe('FashionMagazineComponent', () => {
  let component: FashionMagazineComponent;
  let fixture: ComponentFixture<FashionMagazineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FashionMagazineComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FashionMagazineComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
