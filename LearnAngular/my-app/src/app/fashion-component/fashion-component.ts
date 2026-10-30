import { Component, signal, OnInit } from '@angular/core';
import { FashionAPIService } from '../services/fashion-apiservice';
import { Fashion } from '../classes/Fashion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fashion-component',
  standalone: false,
  templateUrl: './fashion-component.html',
  styleUrl: './fashion-component.css',
})
export class FashionComponent implements OnInit {
  fashions = signal<Fashion[]>([]);
  styles = signal<string[]>([]);
  selectedStyle = signal<string>('');
  errMessage = signal('');
  successMessage = signal('');
  isLoading = signal<boolean>(false);

  constructor(
    public _service: FashionAPIService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStyles();
    this.loadFashions();
  }

  loadStyles(): void {
    this._service.getStyles().subscribe({
      next: (data) => this.styles.set(data),
      error: (err) => console.error('Error loading styles:', err)
    });
  }

  loadFashions(style?: string): void {
    this.isLoading.set(true);
    this.errMessage.set('');
    this._service.getFashions(style).subscribe({
      next: (data) => {
        this.fashions.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errMessage.set(err?.message || String(err));
        this.isLoading.set(false);
      }
    });
  }

  onStyleFilterChange(style: string): void {
    this.selectedStyle.set(style);
    this.loadFashions(style || undefined);
  }

  viewDetail(id: string): void {
    this.router.navigate(['/fashion-detail'], { queryParams: { id } });
  }

  viewDetailSlug(fashion: Fashion): void {
    const slug = fashion.getSlug();
    this.router.navigate(['/fashion-detail', slug]);
  }

  editFashion(id: string): void {
    this.router.navigate(['/fashion-update'], { queryParams: { id } });
  }

  deleteFashion(id: string, subject: string): void {
    const isConfirm = window.confirm(`Bạn có chắc chắn muốn xóa Fashion "${subject}" (ID: ${id})?`);
    if (isConfirm) {
      this._service.deleteFashion(id).subscribe({
        next: () => {
          this.successMessage.set(`Đã xóa thành công "${subject}"!`);
          this.fashions.update((list) => list.filter((f) => f._id !== id));
          setTimeout(() => this.successMessage.set(''), 3000);
        },
        error: (err) => {
          this.errMessage.set('Xóa thất bại: ' + (err?.message || String(err)));
        }
      });
    }
  }
}
