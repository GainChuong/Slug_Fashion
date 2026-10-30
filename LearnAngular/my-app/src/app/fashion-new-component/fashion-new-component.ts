import { Component, OnInit } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fashion-new-component',
  standalone: false,
  templateUrl: './fashion-new-component.html',
  styleUrl: './fashion-new-component.css',
})
export class FashionNewComponent implements OnInit {
  fashion = new Fashion();
  styles = ['STREET STYLE', 'TRENDS', 'VINTAGE', 'CASUAL'];
  errMessage: string = '';
  isSubmitting: boolean = false;
  imagePreview: string = '';

  constructor(
    private _service: FashionAPIService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._service.getStyles().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          // Gộp các style hiện có vào danh sách gợi ý
          this.styles = Array.from(new Set([...this.styles, ...data]));
        }
      }
    });
  }

  // Đọc file ảnh chuyển sang Base64
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.fashion.fashion_image = reader.result!.toString();
        this.imagePreview = this.fashion.fashion_image;
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
    }
  }

  // WYSIWYG Command Helper cho trường chi tiết
  execCmd(command: string, value: string = '') {
    document.execCommand(command, false, value);
  }

  onDetailInput(event: any) {
    this.fashion.fashion_detail = event.target.innerHTML;
  }

  postFashion() {
    this.errMessage = '';
    if (!this.fashion.style || !this.fashion.fashion_subject) {
      this.errMessage = 'Vui lòng nhập đầy đủ Style và Tiêu đề Fashion!';
      return;
    }

    this.isSubmitting = true;
    this.fashion.created_at = new Date().toISOString();

    this._service.postFashion(this.fashion).subscribe({
      next: (data) => {
        this.isSubmitting = false;
        alert('Thêm mới Fashion thành công!');
        // Theo yêu cầu đề bài: "sau khi lưu thành công thì quay trở lại màn hình xem danh sách"
        this.router.navigate(['/fashion-list']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errMessage = 'Lỗi khi thêm mới: ' + (err?.message || String(err));
      }
    });
  }
}
