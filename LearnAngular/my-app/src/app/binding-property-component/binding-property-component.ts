import { Component } from '@angular/core';

@Component({
  selector: 'app-binding-property-component',
  standalone: false,
  styleUrl: './binding-property-component.css',
  templateUrl: './binding-property-component.html',
})
export class BindingPropertyComponent {
  public name: string ="Nguyễn Ngọc Trường"
  public email: string ="giangnntk24411@uel.vn"
  public nameid: string="GiangNguyen"
  public emailid: string="email"
  public isDisable:boolean=false
  public hello: string="Hey! How is going"
}
