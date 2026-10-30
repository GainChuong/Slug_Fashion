import { Injectable } from '@angular/core';
import { Product } from '../classes/IProduct';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
    productsImage = [ 
      {
        "ProductId": "p1", "id": 1, 
        "ProductName": "AirPods Max", "name": "AirPods Max", 
        "Price": 100, "price": 100, 
        "Image": "https://bizweb.dktcdn.net/thumb/1024x1024/100/459/953/products/airpods-max-2024-3.jpg?v=1726488178540",
        "image": "https://bizweb.dktcdn.net/thumb/1024x1024/100/459/953/products/airpods-max-2024-3.jpg?v=1726488178540"
      }, 
      {
        "ProductId": "p2", "id": 2, 
        "ProductName": "Bàn Phím Logitech", "name": "Bàn Phím Logitech", 
        "Price": 300, "price": 300, 
        "Image": "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/323008/ban-phim-bluetooth-logitech-k380s-hong-3-638620803301909154.jpg",
        "image": "https://cdnv2.tgdd.vn/mwg-static/tgdd/Products/Images/4547/323008/ban-phim-bluetooth-logitech-k380s-hong-3-638620803301909154.jpg"
      }, 
      {
        "ProductId": "p3", "id": 3, 
        "ProductName": "Chuột Bluetooth Dareu", "name": "Chuột Bluetooth Dareu", 
        "Price": 200, "price": 200, 
        "Image": "https://cdn.tgdd.vn/Products/Images/86/308333/chuot-bluetooth-slient-dareu-lm115b-den-1.jpg",
        "image": "https://cdn.tgdd.vn/Products/Images/86/308333/chuot-bluetooth-slient-dareu-lm115b-den-1.jpg"
      }, 
    ];

  constructor() { } 

  getProductsWithImages() { 
    return this.productsImage;
  } 

  getProductDetail(id: any) { 
    return this.productsImage.find(x => x.ProductId == id || x.id == id);
  } 
}
