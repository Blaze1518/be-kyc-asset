---
description: Transaction and error handling conventions for NestJS services
globs: src/**/*.ts
alwaysApply: false
---

# Transaction And Error Handling

- Service cấp use-case phải là nơi sở hữu transaction. Ví dụ `AuthService.register()` sở hữu toàn bộ flow `create user + create refresh token`.

- Không mở transaction lồng nhau trong service con nếu caller đã truyền `ctx`. Service con nên nhận `ctx?: IDatabaseContext`; nếu có `ctx` thì dùng lại, nếu không có thì tự mở transaction cho use-case độc lập.

- Repository không quyết định business transaction. Repository chỉ nhận `ctx?: IDatabaseContext` và dùng `getModel(ctx)` để chạy query bằng transaction client hoặc Prisma client mặc định.

- Một flow nghiệp vụ phải atomic khi các bước phụ thuộc nhau về dữ liệu. Nếu tạo user thành công nhưng lưu refresh token fail thì phải rollback cả user, tránh dữ liệu mồ côi và lỗi conflict khi retry.

- Không dùng `try/catch` ở controller/service nếu chỉ để throw lại lỗi. Hãy throw `HttpException` có ý nghĩa ở tầng domain/service, để global exception filter format response.

- Controller nên mỏng: nhận DTO/meta, gọi service, set cookie/header nếu cần, return response rõ ràng. Business logic và transaction orchestration không đặt trong controller.

- Khi dùng `async/await`, chỉ `await` các bước có phụ thuộc tuần tự. Các bước độc lập có thể chạy song song, nhưng không đánh đổi tính nhất quán transaction.

- Ưu tiên code đơn giản, rõ owner trách nhiệm: controller điều phối HTTP, service điều phối nghiệp vụ, repository truy cập dữ liệu, token/password service xử lý chuyên môn riêng.
