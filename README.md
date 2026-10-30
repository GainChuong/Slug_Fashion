# Project: Slug Fashion

## 1. Gioi thieu
Bai tap lan nay tap trung vao chuc nang Slug Fashion voi cac yeu cau chinh:
- Bo sung cot IdF kieu so nguyen khong trung nhau cho du lieu Fashion trong MongoDB.
- Tao Slug chuan SEO cho Fashion theo dinh dang: ten-san-pham-p{IdF}.
- Khi nguoi dung chon hoac nhap bat ky Slug nao, he thong tu dong phan tich va trich xuat IdF de hien thi chinh xac Fashion Detail tuong ung.

## 2. Menu cua bai tap lan nay
Tren thanh dieu huong (menu), bai tap duoc tach rieng thanh mot menu doc lap:
- Menu chinh: SLUG FASHION
  + Slug Fashion List: Danh sach Fashion kem cot IdF, Thumbnail, Fashion Subject, Style, va chuoi Slug SEO.
  + Slug Fashion Detail & Analyzer: Man hinh phan tich Slug truc quan va xem chi tiet Fashion.

Duong dan routing:
- /fashion-slug : Danh sach cac san pham thoi trang kem link Slug.
- /fashion-slug/:slug : Xem chi tiet thoi trang theo Slug (vi du: /fashion-slug/victoria-beckham-p10).
- /fashion-slug-detail : Cong cu kiem thu va phan tich Slug.

## 3. Cau truc thu muc
- LearnAngular/my-app: Ung dung Frontend Angular (chay o cong 4200).
- LearnAngular/my-server-mongodb: Server NodeJS Express ket noi MongoDB FashionData (chay o cong 3002).

## 4. Huong dan khoi chay

### Buoc 1: Khoi dong Backend MongoDB
1. Mo terminal tai thu muc: LearnAngular/my-server-mongodb
2. Cai dat thu vien neu chua co:
   npm install
3. Chay server:
   npm start
Server backend se lang nghe tai cong 3002.

### Buoc 2: Khoi dong Frontend Angular
1. Mo terminal tai thu muc: LearnAngular/my-app
2. Cai dat thu vien neu chua co:
   npm install
3. Chay ung dung:
   npm start
Truy cap trinh duyet tai: http://localhost:4200 va chon menu "SLUG FASHION".
