import { Component, OnInit, signal, computed } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';
import { Router } from '@angular/router';

export interface StyleGroup {
  styleName: string;
  items: Fashion[];
}

@Component({
  selector: 'app-fashion-slug-component',
  standalone: false,
  templateUrl: './fashion-slug-component.html',
  styleUrl: './fashion-slug-component.css',
})
export class FashionSlugComponent implements OnInit {
  // Dữ liệu thời trang
  allFashions = signal<Fashion[]>([]);
  stylesList = signal<string[]>([]);
  selectedStyle = signal<string>('ALL');
  searchKeyword = signal<string>('');

  // Trạng thái giao diện
  isLoading = signal<boolean>(false);
  errMessage = signal<string>('');

  // Modal / Xem chi tiết sản phẩm Spotlight kiểu Tạp chí
  activeFashion = signal<Fashion | null>(null);

  // Modal Thêm / Sửa Fashion nhanh (Admin Editorial)
  showFormModal = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  editingFashion = new Fashion();
  imagePreview: string = '';
  isSaving: boolean = false;

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
        this.allFashions.set(mapped);

        // Lấy danh sách styles duy nhất
        const styles = Array.from(
          new Set(mapped.map((f) => f.style?.trim().toUpperCase()).filter(Boolean))
        );
        this.stylesList.set(styles);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errMessage.set('Lỗi khi tải dữ liệu từ server: ' + (err?.message || String(err)));
        this.isLoading.set(false);
      },
    });
  }

  // Danh sách phân nhóm theo Style theo layout Tạp chí Vogue
  groupedFashions = computed(() => {
    const list = this.allFashions();
    const currentStyle = this.selectedStyle();
    const keyword = this.searchKeyword().trim().toLowerCase();

    // 1. Lọc theo từ khóa tìm kiếm
    const filtered = list.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.fashion_subject?.toLowerCase().includes(keyword) ||
        item.style?.toLowerCase().includes(keyword) ||
        String(item.IdF).includes(keyword) ||
        item.getSlug().toLowerCase().includes(keyword);

      const matchStyle =
        currentStyle === 'ALL' ||
        item.style?.trim().toUpperCase() === currentStyle.toUpperCase();

      return matchKeyword && matchStyle;
    });

    // 2. Nhóm theo Style
    const groupsMap = new Map<string, Fashion[]>();
    for (const item of filtered) {
      const st = item.style?.trim().toUpperCase() || 'COLLECTIONS';
      if (!groupsMap.has(st)) {
        groupsMap.set(st, []);
      }
      groupsMap.get(st)!.push(item);
    }

    const groups: StyleGroup[] = [];
    groupsMap.forEach((items, styleName) => {
      groups.push({ styleName, items });
    });

    return groups;
  });

  // Chọn bộ lọc style
  filterByStyle(style: string): void {
    this.selectedStyle.set(style);
  }

  // Xem chi tiết dạng Spotlight Tạp chí
  openDetail(fashion: Fashion): void {
    this.activeFashion.set(fashion);
    window.scrollTo({ top: 250, behavior: 'smooth' });
  }

  closeDetail(): void {
    this.activeFashion.set(null);
  }

  // Điều hướng xem trang Slug Detail đầy đủ
  viewDetailSlug(fashion: Fashion, event?: Event): void {
    if (event) event.stopPropagation();
    this.router.navigate(['/fashion-slug', fashion.getSlug()]);
  }

  // Mở modal Thêm mới
  openCreateModal(): void {
    this.isEditMode.set(false);
    this.editingFashion = new Fashion();
    this.editingFashion.style = this.stylesList()[0] || 'CELEBRITY STYLE';
    this.imagePreview = '';
    this.showFormModal.set(true);

    setTimeout(() => {
      const editor = document.getElementById('slug-wysiwyg-editor');
      if (editor) editor.innerHTML = '';
    }, 100);
  }

  // Mở modal Chỉnh sửa
  openEditModal(fashion: Fashion, event: Event): void {
    event.stopPropagation();
    this.isEditMode.set(true);
    this.editingFashion = Object.assign(new Fashion(), fashion);
    this.imagePreview = this.editingFashion.getBase64String();
    this.showFormModal.set(true);

    setTimeout(() => {
      const editor = document.getElementById('slug-wysiwyg-editor');
      if (editor) editor.innerHTML = this.editingFashion.fashion_detail || '';
    }, 100);
  }

  closeFormModal(): void {
    this.showFormModal.set(false);
  }

  // Xóa trực tiếp có confirm
  deleteFashion(fashion: Fashion, event: Event): void {
    event.stopPropagation();
    const isConfirm = window.confirm(`Bạn có chắc muốn xóa Fashion "${fashion.fashion_subject}"?`);
    if (isConfirm) {
      this._service.deleteFashion(fashion._id).subscribe({
        next: () => {
          this.allFashions.update((list) => list.filter((f) => f._id !== fashion._id));
          if (this.activeFashion()?._id === fashion._id) {
            this.activeFashion.set(null);
          }
        },
        error: (err) => alert('Lỗi khi xóa: ' + (err?.message || String(err))),
      });
    }
  }

  // Upload file ảnh
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.editingFashion.fashion_image = reader.result!.toString();
        this.imagePreview = this.editingFashion.fashion_image;
      };
    }
  }

  // WYSIWYG Editor Commands
  execCmd(command: string, value: string = ''): void {
    document.execCommand(command, false, value);
  }

  onDetailInput(event: any): void {
    this.editingFashion.fashion_detail = event.target.innerHTML;
  }

  // Lưu Fashion
  saveFashion(): void {
    if (!this.editingFashion.style || !this.editingFashion.fashion_subject) {
      alert('Vui lòng nhập phong cách (Style) và Tiêu đề Fashion!');
      return;
    }

    this.isSaving = true;
    if (this.isEditMode()) {
      this._service.putFashion(this.editingFashion).subscribe({
        next: (saved) => {
          this.isSaving = false;
          this.allFashions.update((list) =>
            list.map((f) => (f._id === saved._id ? Object.assign(new Fashion(), saved) : f))
          );
          if (this.activeFashion()?._id === saved._id) {
            this.activeFashion.set(Object.assign(new Fashion(), saved));
          }
          this.closeFormModal();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Lỗi cập nhật: ' + (err?.message || String(err)));
        },
      });
    } else {
      this.editingFashion.created_at = new Date().toISOString();
      this._service.postFashion(this.editingFashion).subscribe({
        next: (created) => {
          this.isSaving = false;
          const newInst = Object.assign(new Fashion(), created);
          this.allFashions.update((list) => [newInst, ...list]);
          this.closeFormModal();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Lỗi thêm mới: ' + (err?.message || String(err)));
        },
      });
    }
  }
}
