import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FashionSlugDetailComponent } from './fashion-slug-detail-component';

describe('FashionSlugDetailComponent', () => {
  let component: FashionSlugDetailComponent;
  let fixture: ComponentFixture<FashionSlugDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FashionSlugDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FashionSlugDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
