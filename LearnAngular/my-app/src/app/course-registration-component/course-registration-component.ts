import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CourseRegistration } from '../classes/CourseRegistration';

@Component({
  selector: 'app-course-registration-component',
  standalone: false,
  styleUrl: './course-registration-component.css',
  templateUrl: './course-registration-component.html',
})
export class CourseRegistrationComponent {
  courseModel=new CourseRegistration();
  onSubmit(){
    let infor=this.courseModel.getInfor()
    console.log("Dữ liệu khóa học",this.courseModel.getInfor())
    alert(infor)
}
}
