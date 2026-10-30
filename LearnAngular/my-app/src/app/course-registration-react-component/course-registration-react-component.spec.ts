import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseRegistrationReactComponent } from './course-registration-react-component';

describe('CourseRegistrationReactComponent', () => {
  let component: CourseRegistrationReactComponent;
  let fixture: ComponentFixture<CourseRegistrationReactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CourseRegistrationReactComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CourseRegistrationReactComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
