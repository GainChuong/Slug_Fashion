import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-course-registration-react-component',
  standalone: false,
  styleUrl: './course-registration-react-component.css',
  templateUrl: './course-registration-react-component.html',
})
export class CourseRegistrationReactComponent {
  public regForm: FormGroup = new FormGroup(
    {
      name: new FormControl('Trần Duy Thanh', [Validators.required, Validators.minLength(3), this.customerNameValidator]),
      email: new FormControl('thanhtd@uel.edu.vn', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), this.customPasswordValidator()]),
      confirmPass: new FormControl('', [Validators.required, Validators.minLength(8), this.customPasswordValidator()]),
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  setDefaultValues() {
    this.regForm.patchValue({
      name: 'Trần Duy Thanh',
      email: 'thanhtd@uel.edu.vn',
    });
  }

  customerNameValidator(control: AbstractControl): { [key: string]: any } | null {
    const matchName = /[@#$%^&*()_+]/.test(control.value);
    return matchName ? { nameNotMatch: { value: control.value } } : null;
  }

  customPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value ?? '';
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

      if (!value) {
        return null;
      }

      return regex.test(value) ? null : { weakPassword: true };
    };
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPass = control.get('confirmPass');

    if (password && confirmPass && password.value !== confirmPass.value) {
      return { mismatch: true };
    }

    return null;
  }

  onSubmit() {
    if (this.regForm.invalid) {
      this.regForm.markAllAsTouched();
      alert('Vui lòng nhập đầy đủ và đúng thông tin bắt buộc');
      return;
    }

    console.log('Dữ liệu gửi đi:', this.regForm.value);
    const info = JSON.stringify(this.regForm.value);
    alert('Xử lý dữ liệu:\n' + info);
  }
}
