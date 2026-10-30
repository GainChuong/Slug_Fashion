import { Component, signal } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../services/fashion-apiservice';

export interface FashionSearchResult {
  fashion: Fashion;
  similarity: number;
  highlightCategory: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-fashion-search-component',
  standalone: false,
  templateUrl: './fashion-search-component.html',
  styleUrl: './fashion-search-component.css',
})
export class FashionSearchComponent {
  // Toàn bộ dữ liệu load từ MongoDB qua FashionAPIService
  allFashions = signal<Fashion[]>([]);
  
  // Dữ liệu kết quả tìm kiếm đã tính Jaccard và lọc theo limit
  searchResults = signal<FashionSearchResult[]>([]);

  // State các control form
  keyword: string = '';
  searchField: 'fashion_subject' | 'fashion_detail' = 'fashion_subject';
  limitOption: number = 10;
  
  // Trạng thái giao diện
  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);
  errMessage = signal<string>('');

  constructor(private _fashionService: FashionAPIService) {
    this.loadAllFashions();
  }

  // Tải dữ liệu Fashions từ server MongoDB
  loadAllFashions(): void {
    this.isLoading.set(true);
    this._fashionService.getFashions().subscribe({
      next: (data) => {
        const mapped = data.map((item) => Object.assign(new Fashion(), item));
        this.allFashions.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errMessage.set('Lỗi khi tải dữ liệu từ server: ' + (err.message || err));
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Tính toán độ tương đồng Jaccard giữa 2 chuỗi văn bản:
   * Jaccard(A, B) = |A ∩ B| / |A ∪ B|
   * Ở đây tách từ (word tokens), chuyển thường và loại bỏ ký tự đặc biệt.
   */
  calculateJaccardSimilarity(strA: string, strB: string): number {
    if (!strA || !strB) return 0;

    const tokenize = (text: string): Set<string> => {
      const words = text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'<>\[\]]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.trim().length > 0);
      return new Set(words);
    };

    const setA = tokenize(strA);
    const setB = tokenize(strB);

    if (setA.size === 0 && setB.size === 0) return 1.0;
    if (setA.size === 0 || setB.size === 0) return 0.0;

    let intersectionCount = 0;
    for (const item of setA) {
      if (setB.has(item)) {
        intersectionCount++;
      }
    }

    const unionCount = new Set([...setA, ...setB]).size;
    if (unionCount === 0) return 0;

    return Number((intersectionCount / unionCount).toFixed(4));
  }

  // Thực hiện tìm kiếm
  onSearch(): void {
    const term = this.keyword.trim();
    this.hasSearched.set(true);

    if (!term) {
      this.searchResults.set([]);
      return;
    }

    const list = this.allFashions();
    const scoredList: FashionSearchResult[] = list.map((item) => {
      const targetText =
        this.searchField === 'fashion_subject'
          ? (item.fashion_subject || '')
          : (item.fashion_detail || '');

      const score = this.calculateJaccardSimilarity(term, targetText);

      let highlightCategory: 'high' | 'medium' | 'low' = 'low';
      if (score >= 0.75) {
        highlightCategory = 'high'; // [0.75 -> 1.0] Hồng
      } else if (score >= 0.5) {
        highlightCategory = 'medium'; // [0.5 -> 0.75) Vàng
      } else {
        highlightCategory = 'low'; // < 0.5 Xám
      }

      return {
        fashion: item,
        similarity: score,
        highlightCategory,
      };
    });

    // Sắp xếp giảm dần theo Jaccard Similarity
    scoredList.sort((a, b) => b.similarity - a.similarity);

    // Lọc theo số lượng kết quả hiển thị (limit)
    const limitedResults =
      this.limitOption > 0
        ? scoredList.slice(0, this.limitOption)
        : scoredList;

    this.searchResults.set(limitedResults);
  }

  // Reset form tìm kiếm
  onReset(): void {
    this.keyword = '';
    this.searchField = 'fashion_subject';
    this.limitOption = 10;
    this.searchResults.set([]);
    this.hasSearched.set(false);
  }

  // Trả về class CSS tương ứng theo giá trị similarity
  getRowHighlightClass(similarity: number): string {
    if (similarity >= 0.75) {
      return 'row-pink';
    } else if (similarity >= 0.5) {
      return 'row-yellow';
    } else {
      return 'row-gray';
    }
  }

  // Đếm nhanh số lượng theo từng nhóm
  getCountByRange(min: number, max: number, inclusiveMax: boolean = false): number {
    return this.searchResults().filter((r) => {
      if (inclusiveMax) return r.similarity >= min && r.similarity <= max;
      return r.similarity >= min && r.similarity < max;
    }).length;
  }
}
