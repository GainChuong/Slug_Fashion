import { Component, signal, OnInit } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';
import { ActivatedRoute } from '@angular/router';
import { extractIdFromSlug, getIdentityType } from '../classes/SlugHelper';

@Component({
  selector: 'app-fashion-detail-component',
  standalone: false,
  templateUrl: './fashion-detail-component.html',
  styleUrl: './fashion-detail-component.css',
})
export class FashionDetailComponent implements OnInit {
  fashion = signal<Fashion | null>(null);
  errMessage = signal('');
  searchIdInput: string = '';
  isLoading = signal<boolean>(false);
  currentSlug = signal<string>('');

  constructor(
    private _service: FashionAPIService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 1. Kiểm tra tham số đường dẫn Path Param (ví dụ: /fashion-detail/ao-khoac-da-p2 hoặc /fashion-detail/66432...)
    this.route.paramMap.subscribe((params) => {
      const slugOrId = params.get('slugOrId');
      if (slugOrId) {
        this.searchIdInput = slugOrId;
        this.resolveAndLoadFashion(slugOrId);
      }
    });

    // 2. Kiểm tra Query Param (ví dụ: /fashion-detail?id=...)
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id && !this.searchIdInput) {
        this.searchIdInput = id;
        this.resolveAndLoadFashion(id);
      }
    });
  }

  // Tự động phân tích Slug / IdF / ObjectId để tải chính xác Fashion
  resolveAndLoadFashion(identity: string) {
    this.fashion.set(null);
    this.errMessage.set('');
    const trimmed = identity ? identity.trim() : '';

    if (!trimmed) {
      this.errMessage.set('Vui lòng cung cấp Slug hoặc ID của Fashion!');
      return;
    }

    this.isLoading.set(true);

    // Xác định kiểu định danh theo helper
    const idType = getIdentityType(trimmed);
    let queryKey = trimmed;

    if (idType === 'SLUG_WITH_ID') {
      const extractedId = extractIdFromSlug(trimmed);
      if (extractedId !== null) {
        queryKey = String(extractedId);
      }
    }

    this._service.getFashion(queryKey).subscribe({
      next: (data) => {
        const fashionInstance = Object.assign(new Fashion(), data);
        this.fashion.set(fashionInstance);
        this.currentSlug.set(fashionInstance.getSlug());
        this.isLoading.set(false);
      },
      error: (err) => {
        // Dự phòng: Nếu tìm bằng queryKey chưa được, thử tìm trực tiếp bằng chuỗi gốc
        if (queryKey !== trimmed) {
          this._service.getFashion(trimmed).subscribe({
            next: (data) => {
              const fashionInstance = Object.assign(new Fashion(), data);
              this.fashion.set(fashionInstance);
              this.currentSlug.set(fashionInstance.getSlug());
              this.isLoading.set(false);
            },
            error: (finalErr) => {
              this.errMessage.set('Không tìm thấy Fashion theo Slug/ID: ' + (finalErr?.message || String(finalErr)));
              this.isLoading.set(false);
            }
          });
        } else {
          this.errMessage.set('Không tìm thấy Fashion hoặc lỗi: ' + (err?.message || String(err)));
          this.isLoading.set(false);
        }
      }
    });
  }
}
