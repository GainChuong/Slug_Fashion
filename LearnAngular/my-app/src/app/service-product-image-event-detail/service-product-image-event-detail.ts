import { Component } from '@angular/core'; 
import { ActivatedRoute, Router } from '@angular/router'; 
import { ProductService } from '../services/product-service';
 
@Component({ 
  selector: 'app-service-product-image-event-detail', 
  templateUrl: './service-product-image-event-detail.html', 
  styleUrls: ['./service-product-image-event-detail.css'],
  standalone: false
}) 
export class ServiceProductImageEventDetailComponent { 
  selectedProduct: any;

  constructor(private activateRoute:ActivatedRoute,private _fs:ProductService, 
private router:Router) 
  { 
    activateRoute.paramMap.subscribe( 
      (param)=>{ 
        let id=param.get('id') 
         
        if(id!=null) 
        { 
          this.selectedProduct=_fs.getProductDetail(id)           
        } 
      } 
    ) 
  } 
  goBack(){ 
    this.router.navigate(['service-product-image-event']) 
  } 
} 