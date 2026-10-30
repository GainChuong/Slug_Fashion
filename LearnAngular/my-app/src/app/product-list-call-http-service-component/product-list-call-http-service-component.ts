import { Component, signal } from '@angular/core';
import { Product } from '../classes/IProduct';
import { ProductHttpService } from '../services/product-http-service';

@Component({
  selector: 'app-product-list-call-http-service-component',
  standalone: false,
  styleUrl: './product-list-call-http-service-component.css',
  templateUrl: './product-list-call-http-service-component.html',
})
export class ProductListCallHttpServiceComponent {

  products = signal<Product[]>([]);

  constructor(private ps: ProductHttpService) {}

  ngOnInit(): void {
    this.ps.getProducts().subscribe({
      next: (data: Product[]) => {
        this.products.set(data);
      },
      error: (err: any) => {
        console.log(err);
        alert("Lỗi khi gọi API " + JSON.stringify(err));
      }
    });
  }
}
