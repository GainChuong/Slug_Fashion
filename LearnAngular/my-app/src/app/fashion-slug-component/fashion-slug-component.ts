import { Component, OnInit, signal, computed } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';
import { Router } from '@angular/router';
import { createSlug } from '../classes/SlugHelper';

@Component({
  selector: 'app-fashion-slug-component',
  standalone: false,
  templateUrl: './fashion-slug-component.html',
  styleUrl: './fashion-slug-component.css',
})
export class FashionSlugComponent implements OnInit {
  fashions = signal<Fashion[]>([]);
  styles = signal<string[]>([]);
  selectedStyle = signal<string>('ALL');
  searchTerm = signal<string>('');
  isLoading = signal<boolean>(false);
  errMessage = signal<string>('');

  // Hàm tạo slug chuẩn
  public generateSlug = createSlug;

  constructor(
    private _service: FashionAPIService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errMessage.set('');

    this._service.getFashions().subscribe({
      next: (data) => {
        const mapped = data.map((item) => Object.assign(new Fashion(), item));
        this.fashions.set(mapped);

        // Lấy danh sách styles duy nhất
        const distinctStyles = Array.from(
          new Set(mapped.map((f) => f.style?.trim().toUpperCase()).filter(Boolean))
        );
        this.styles.set(distinctStyles);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errMessage.set('Lỗi khi tải dữ liệu thời trang: ' + (err?.message || String(err)));
        this.isLoading.set(false);
      }
    });
  }

  // Danh sách hiển thị sau khi lọc và tìm kiếm
  filteredFashions = computed(() => {
    const list = this.fashions();
    const styleFilter = this.selectedStyle();
    const keyword = this.searchTerm().trim().toLowerCase();

    return list.filter((item) => {
      const matchStyle =
        styleFilter === 'ALL' ||
        item.style?.trim().toUpperCase() === styleFilter.toUpperCase();
      const matchKeyword =
        !keyword ||
        item.fashion_subject?.toLowerCase().includes(keyword) ||
        item.style?.toLowerCase().includes(keyword) ||
        String(item.IdF).includes(keyword) ||
        item.getSlug().toLowerCase().includes(keyword);

      return matchStyle && matchKeyword;
    });
  });

  // Điều hướng xem chi tiết bằng Slug chuẩn SEO
  viewDetailSlug(fashion: Fashion): void {
    const slug = fashion.getSlug();
    this.router.navigate(['/fashion-slug', slug]);
  }

  // Điều hướng xem chi tiết bằng IdF số
  viewDetailByIdF(fashion: Fashion): void {
    this.router.navigate(['/fashion-slug', fashion.IdF]);
  }
}
