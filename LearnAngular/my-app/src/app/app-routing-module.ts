import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list-component/product-list-component';
import { ProductDropdownListComponent } from './product-dropdown-list-component/product-dropdown-list-component';
import { ProductListCallServiceComponent } from './product-list-call-service-component/product-list-call-service-component';
import { ProductListCallHttpServiceComponent } from './product-list-call-http-service-component/product-list-call-http-service-component';
import { ProductHttpHandleErrorServiceComponent } from './product-http-handle-error-service-component/product-http-handle-error-service-component';
import { ServiceProductImageEvent } from './service-product-image-event/service-product-image-event';
import { ServiceProductImageEventDetailComponent } from './service-product-image-event-detail/service-product-image-event-detail';
import { ProductDetailComponent } from './product-detail-component/product-detail-component';
import { ProductListAdvancedComponent } from './product-list-advanced-component/product-list-advanced-component';
import { ProductListSearchComponent } from './product-list-search-component/product-list-search-component';
import { PageNotFoundComponent } from './page-not-found-component/page-not-found-component';
import { Contact } from './contact/contact';
import { authGuard } from './classes/auth.guard';
import { CourseRegistrationComponent } from './course-registration-component/course-registration-component';
import { LoginComponent } from './login-component/login-component';
import { CourseRegistrationReactComponent } from './course-registration-react-component/course-registration-react-component';
import { FakeProductComponent } from './fake-product-component/fake-product-component';
import { BooksComponent } from './books-component/books-component';
import { BookDetailComponent } from './book-detail-component/book-detail-component';
import { BookNewComponent } from './book-new-component/book-new-component';
import { BookUpdateComponent } from './book-update-component/book-update-component';
import { BookDeleteComponent } from './book-delete-component/book-delete-component';
import { FashionComponent } from './fashion-component/fashion-component';
import { FashionDetailComponent } from './fashion-detail-component/fashion-detail-component';
import { FashionNewComponent } from './fashion-new-component/fashion-new-component';
import { FashionSearchComponent } from './fashion-search-component/fashion-search-component';
import { FashionUpdateComponent } from './fashion-update-component/fashion-update-component';
import { FashionDeleteComponent } from './fashion-delete-component/fashion-delete-component';
import { FashionMagazineComponent } from './fashion-magazine-component/fashion-magazine-component';
import { LoginAuthComponent } from './login-auth-component/login-auth-component';
import { FashionSlugComponent } from './fashion-slug-component/fashion-slug-component';
import { FashionSlugDetailComponent } from './fashion-slug-detail-component/fashion-slug-detail-component';

const routes: Routes = [
  { path: '', redirectTo: 'learn-directive', pathMatch: 'full' },
  { path: 'home', redirectTo: 'learn-directive', pathMatch: 'full' },
  { path: 'contacts', component: ProductListComponent },
  { path: 'product-dropdown-list', component: ProductDropdownListComponent },
  { path: 'product-list-call-service', component: ProductListCallServiceComponent },
  { path: 'app-product-list-call-http-service-component', component: ProductListCallHttpServiceComponent },
  { path: 'app-product-http-handle-error-service-component', component: ProductHttpHandleErrorServiceComponent },
  { path: 'service-product-image-event', component: ServiceProductImageEvent },
  { path: 'service-product-image-event/:id', component: ServiceProductImageEventDetailComponent },
  { path: "products/:id", component: ProductDetailComponent },
  { path: "products", component: ProductListAdvancedComponent },
  { path: "searchproducts", component: ProductListSearchComponent },
  { path: "", component: Contact },
  {
    path: "sample-nested", component: ProductListAdvancedComponent,
    children: [
      { path: "search-child", component: ProductListSearchComponent },
      { path: "detail/:id", component: ProductDetailComponent }
    ]
  },
  {
    path: 'lazyinfor', loadComponent: () => import('./lazy-component/lazy-component').then(m => m.LazyComponent)
    , canActivate: [authGuard]
  },
  { path: "course-register", component: CourseRegistrationComponent },
  { path: "login", component: LoginComponent },
  { path: "course-react-register", component: CourseRegistrationReactComponent },
  { path: "fake-product", component: FakeProductComponent },
  { path: "book-list", component: BooksComponent },
  { path: "book-detail", component: BookDetailComponent },
  { path: "book-new", component: BookNewComponent, canActivate: [authGuard] },
  { path: "book-update", component: BookUpdateComponent, canActivate: [authGuard] },
  { path: "book-delete", component: BookDeleteComponent, canActivate: [authGuard] },
  { path: "fashion-list", component: FashionComponent },
  { path: "fashion-detail", component: FashionDetailComponent },
  { path: "fashion-detail/:slugOrId", component: FashionDetailComponent },
  { path: "fashion-new", component: FashionNewComponent, canActivate: [authGuard] },
  { path: "fashion-search", component: FashionSearchComponent },
  { path: "fashion-update", component: FashionUpdateComponent, canActivate: [authGuard] },
  { path: "fashion-delete", component: FashionDeleteComponent, canActivate: [authGuard] },
  { path: "fashion-magazine", component: FashionMagazineComponent },
  { path: "fashion-slug", component: FashionSlugComponent },
  { path: "fashion-slug-detail", component: FashionSlugDetailComponent },
  { path: "fashion-slug/:slug", component: FashionSlugDetailComponent },
  {path: "login-auth", component: LoginAuthComponent},
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
