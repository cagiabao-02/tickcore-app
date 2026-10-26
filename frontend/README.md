# Frontend

React 18 + Vite + TypeScript strict. Xem [README gốc](../README.md) để biết tài khoản mẫu, luồng kiểm tra và toàn bộ giả định.

```sh
npm ci
cp .env.example .env
npm run dev
npm run lint
npm run build
npm run test:mock
npm run test:http
npm run check:i18n
npm run check:contract
npm run format:check
```

Mặc định chạy ở `http://localhost:3000`. `.env.example` chứa `VITE_ENABLE_MOCK=true` và `VITE_API_BASE_URL=/api/v1`. Tắt mock bằng `false`, khởi động lại Vite và tự triển khai backend trước khi dùng API thật. Proxy `/api` trỏ `localhost:8080`.

Sau khi đã cài dependencies, những lần mở dự án tiếp theo chỉ cần `npm run dev`. Trước khi chạy lại `npm ci`, dừng các terminal Vite/build của dự án bằng `Ctrl+C`.

Nếu Windows báo `EPERM ... unlink ... rolldown-binding...node`, một tiến trình có thể đang giữ thư viện native. Dừng đúng Vite/build của dự án rồi chạy lại `npm ci`; chỉ chạy `npm run dev` sau khi cài thành công. Lỗi `'vite' is not recognized` sau đó thường là hậu quả của lần cài bị dở.

`src/features` chứa trang, component và lớp API từng chức năng; `src/mocks` chặn HTTP bằng MSW; `src/types/index.ts` giữ hợp đồng dùng chung; `src/i18n/locales` chứa bản dịch Việt/Anh. `scripts/test-mock.mjs` kiểm thử nghiệp vụ qua HTTP và MSW, không cần mở backend.

## Khi IDE gạch đỏ main.tsx

`index.html` chạy `src/main.tsx`. File `src/main.ts` còn lại từ template không được dùng; nó được loại trong `tsconfig.json` để TypeScript không bỏ qua file React có cùng tên gốc. `src/vite-env.d.ts` khai báo kiểu Vite và biến môi trường.

Nếu IDE chưa cập nhật sau khi sửa cấu hình, lưu file rồi chạy **TypeScript: Restart TS Server**. Nếu cần, chọn **TypeScript: Select TypeScript Version → Use Workspace Version**. Dùng `npm run build` để kiểm tra lỗi TypeScript thực tế.

## Giả định

Tailwind 4 cấu hình trong CSS. Kho mock tồn tại trong bộ nhớ của tab. Ví điện tử cố ý thất bại để có thể thử nhánh lỗi, thẻ và QR thành công. Ảnh poster và combo dùng URL ngoài nên cần mạng để tải ảnh. Các giả định chi tiết nằm ở README gốc.
