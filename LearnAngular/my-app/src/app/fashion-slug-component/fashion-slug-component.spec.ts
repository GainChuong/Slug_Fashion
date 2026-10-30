import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FashionSlugComponent } from './fashion-slug-component';

describe('FashionSlugComponent', () => {
  let component: FashionSlugComponent;
  let fixture: ComponentFixture<FashionSlugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FashionSlugComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FashionSlugComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
