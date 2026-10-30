import { Component, OnInit } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-fashion-update-component',
  standalone: false,
  templateUrl: './fashion-update-component.html',
  styleUrl: './fashion-update-component.css',
})
export class FashionUpdateComponent implements OnInit {
  fashion = new Fashion();
  styles = ['STREET STYLE', 'TRENDS', 'VINTAGE', 'CASUAL'];
  errMessage: string = '';
  isSubmitting: boolean = false;
  imagePreview: string = '';

  constructor(
    private _service: FashionAPIService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Tải danh sách styles
    this._service.getStyles().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.styles = Array.from(new Set([...this.styles, ...data]));
        }
      }
    });

    // Lấy query param id nếu có (ví dụ: ?id=66432...)
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadFashion(id);
      }
    });
  }

  loadFashion(id: string) {
    this._service.getFashion(id).subscribe({
      next: (data) => {
        this.fashion = Object.assign(new Fashion(), data);
        this.imagePreview = this.fashion.getBase64String();
        // Cập nhật nội dung vào WYSIWYG
        const editor = document.getElementById('wysiwyg-update-editor');
        if (editor) {
          editor.innerHTML = this.fashion.fashion_detail || '';
        }
      },
      error: (err) => {
        this.errMessage = 'Không thể nạp thông tin Fashion: ' + (err?.message || String(err));
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.fashion.fashion_image = reader.result!.toString();
        this.imagePreview = this.fashion.fashion_image;
      };
    }
  }

  execCmd(command: string, value: string = '') {
    document.execCommand(command, false, value);
  }

  onDetailInput(event: any) {
    this.fashion.fashion_detail = event.target.innerHTML;
  }

  putFashion() {
    this.errMessage = '';
    if (!this.fashion._id) {
      this.errMessage = 'Thiếu ID của Fashion cần cập nhật!';
      return;
    }

    this.isSubmitting = true;
    this._service.putFashion(this.fashion).subscribe({
      next: () => {
        this.isSubmitting = false;
        alert('Cập nhật Fashion thành công!');
        // Quay trở lại trang danh sách theo yêu cầu
        this.router.navigate(['/fashion-list']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errMessage = 'Lỗi cập nhật: ' + (err?.message || String(err));
      }
    });
  }
}
