# Backend skeleton

Java 21, Spring Boot 3.2.5, Maven; package gốc `com.cinema.booking`.

```sh
mvn compile
```

Các tầng nằm dưới `src/main/java/com/cinema/booking`: `controller`, `controller/admin`, `service`, `repository`, `entity`, `dto/request`, `dto/response`, `config`, `security`, `exception`, `scheduler`, `util`.

Controller chỉ chuyển tham số sang service. Các service và job chỉ có comment TODO và ném `UnsupportedOperationException`. Entity không có annotation JPA; repository chỉ mở rộng `JpaRepository`. DTO dùng Java record với tên trường/cấu trúc JSON tương ứng `frontend/src/types/index.ts`.

`application.yml` chỉ chứa khóa mẫu `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRATION`, `CORS_ALLOWED_ORIGINS`. Không có khóa hay mật khẩu thật. Dự án chỉ yêu cầu biên dịch; hãy tự khai báo entity, repository query, service logic, bảo mật và DB trước khi khởi động.

Tài khoản mock chỉ có ở frontend, xem [README gốc](../README.md). Để nối frontend, tự cài các endpoint dưới `/api/v1`, sau đó đặt `VITE_ENABLE_MOCK=false` ở frontend và khởi động lại Vite.

## Giả định

API giá vé, mở khóa người dùng, xóa đánh giá admin và tham số tuổi phim bổ sung theo [README gốc](../README.md#giả-định). Không tự viết nghiệp vụ backend. Chuỗi thời gian ISO-8601 được giữ là `String` trong DTO để khớp dữ liệu frontend; chủ dự án có thể dùng kiểu thời gian nội bộ khi triển khai.
