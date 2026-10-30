import { Component, OnInit, signal } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';
import { ActivatedRoute, Router } from '@angular/router';
import { extractIdFromSlug, getIdentityType } from '../classes/SlugHelper';

export interface SlugAnalysisResult {
  rawSlug: string;
  identityType: 'ID' | 'SLUG_WITH_ID' | 'PURE_SLUG' | 'UNKNOWN';
  extractedIdF: number | null;
  extractedName: string;
  queryKeyUsed: string;
  status: 'ANALYZING' | 'SUCCESS' | 'FAILED';
}

@Component({
  selector: 'app-fashion-slug-detail-component',
  standalone: false,
  templateUrl: './fashion-slug-detail-component.html',
  styleUrl: './fashion-slug-detail-component.css',
})
export class FashionSlugDetailComponent implements OnInit {
  fashion = signal<Fashion | null>(null);
  slugInput: string = '';
  isLoading = signal<boolean>(false);
  errMessage = signal<string>('');

  // Thông tin phân tích Slug trực quan
  analysis = signal<SlugAnalysisResult>({
    rawSlug: '',
    identityType: 'UNKNOWN',
    extractedIdF: null,
    extractedName: '',
    queryKeyUsed: '',
    status: 'UNKNOWN' as any
  });

  constructor(
    private _service: FashionAPIService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. Đọc slug từ route path param: /fashion-slug/:slug
    this.route.paramMap.subscribe((params) => {
      const slugParam = params.get('slug');
      if (slugParam) {
        this.slugInput = slugParam;
        this.analyzeAndLoadFashion(slugParam);
      }
    });

    // 2. Đọc slug từ query param nếu có: /fashion-slug-detail?slug=...
    this.route.queryParams.subscribe((queryParams) => {
      const qSlug = queryParams['slug'] || queryParams['id'];
      if (qSlug && !this.slugInput) {
        this.slugInput = qSlug;
        this.analyzeAndLoadFashion(qSlug);
      }
    });
  }

  // Thuật toán phân tích Slug & trích xuất IdF để nạp Fashion Detail chính xác
  analyzeAndLoadFashion(slugString: string): void {
    const raw = (slugString || '').trim();
    if (!raw) {
      this.errMessage.set('Vui lòng nhập chuỗi Slug hoặc IdF hợp lệ!');
      return;
    }

    this.isLoading.set(true);
    this.errMessage.set('');
    this.fashion.set(null);

    // Bước 1: Xác định kiểu định danh
    const type = getIdentityType(raw);
    let idF: number | null = null;
    let namePart: string = '';
    let queryKey: string = raw;

    if (type === 'SLUG_WITH_ID') {
      // Trường hợp slug chuẩn: ten-san-pham-p{IdF}
      idF = extractIdFromSlug(raw);
      if (idF !== null) {
        queryKey = String(idF); // Truy vấn backend qua IdF
        // Tách phần tên bỏ đuôi -p{IdF}
        namePart = raw.replace(/-p\d+$/, '');
      }
    } else if (type === 'ID') {
      idF = parseInt(raw, 10);
      queryKey = String(idF);
      namePart = `Mã IdF #${idF}`;
    } else {
      namePart = raw;
    }

    // Cập nhật bảng phân tích Slug
    this.analysis.set({
      rawSlug: raw,
      identityType: type,
      extractedIdF: idF,
      extractedName: namePart,
      queryKeyUsed: queryKey,
      status: 'ANALYZING'
    });

    // Bước 2: Gọi API truy vấn MongoDB
    this._service.getFashion(queryKey).subscribe({
      next: (data) => {
        const item = Object.assign(new Fashion(), data);
        this.fashion.set(item);
        this.isLoading.set(false);
        this.analysis.update((curr) => ({ ...curr, status: 'SUCCESS' }));
      },
      error: (err) => {
        // Dự phòng: Nếu query bằng IdF chưa được, thử query trực tiếp bằng rawSlug
        if (queryKey !== raw) {
          this._service.getFashion(raw).subscribe({
            next: (data) => {
              const item = Object.assign(new Fashion(), data);
              this.fashion.set(item);
              this.isLoading.set(false);
              this.analysis.update((curr) => ({ ...curr, status: 'SUCCESS' }));
            },
            error: (secondErr) => {
              this.isLoading.set(false);
              this.errMessage.set('Không tìm thấy Fashion với Slug: ' + raw);
              this.analysis.update((curr) => ({ ...curr, status: 'FAILED' }));
            }
          });
        } else {
          this.isLoading.set(false);
          this.errMessage.set('Không tìm thấy Fashion: ' + (err?.message || String(err)));
          this.analysis.update((curr) => ({ ...curr, status: 'FAILED' }));
        }
      }
    });
  }

  // Chuyển sang slug mới khi người dùng bấm nút phân tích thủ công
  onAnalyzeClick(): void {
    if (this.slugInput.trim()) {
      this.router.navigate(['/fashion-slug', this.slugInput.trim()]);
    }
  }

  goBackToList(): void {
    this.router.navigate(['/fashion-slug']);
  }
}
