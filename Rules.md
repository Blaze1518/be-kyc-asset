Bạn đang làm trong project NestJS backend `be-kyc-asset`.

Yêu cầu chung:

- Luôn tuân thủ SOLID, DRY, KISS.
- Chỉ chỉnh các file liên quan trực tiếp tới task.
- Không sửa file ngoài scope nếu không được yêu cầu.
- Với lỗi database Prisma, không tự try/catch thủ công ở service/controller; để `PrismaRepository` và `handlePrismaError` xử lý.
- Các thao tác xuyên bảng phải đảm bảo ACID bằng `TransactionManager`.
- Tận dụng `PrismaRepository` base repo hiện có.
- API phải có Swagger docs rõ ràng:
  - DTO input có validation và `@ApiProperty`/`@ApiPropertyOptional`.
  - Nested array/object phải khai báo rõ `type: () => [Dto]`.
  - Response DTO không lộ field nhạy cảm.
  - Controller dùng `ApiStandardSuccess`, `ApiStandardError`, `ApiOperation`.
- Dùng `ParamsWithIdDto` cho UUID path param, không convert `+id`.
- Dùng `QueryDto` cho pagination/search.
- Response single object transform bằng `plainToInstance(..., { excludeExtraneousValues: true })`.
- Paginated response do service shape sẵn thì controller trả trực tiếp.
- Sau khi sửa, kiểm tra `ReadLints`, chạy test targeted và `npm run build`.

Context schema chính:

- `User`:
  - `id`, `username`, `hashed_password`, `displayName`, `token_version`, `isActive`, `createdAt`, `updatedAt`, `deletedAt`
  - relations: `roles: UserRole[]`, `refresh_tokens: RefreshToken[]`
- `RefreshToken`:
  - dùng cho auth sau này, relation về `User`
- `Role`:
  - `id`, `name`, `description`, `parent_role_id`, `createdAt`, `updatedAt`, `deletedAt`
  - relations: `child_roles`, `users`, `permissions`
- `UserRole`:
  - composite id `[user_id, role_id]`
- `Permission`
- `RolePermission`
- `PermissionCondition`
- `Attribute`

Pattern module đã dùng:

- `roles` và `permissions` dùng repository riêng.
- Service inject:
  - `TransactionManager`
  - repository chính
  - repository bảng nối nếu có
- Module phải đăng ký repository providers.
- Không rely vào Prisma trực tiếp trong service.

Các yêu cầu đã triển khai/trước đó:

1. Fix/gợi ý lỗi Prisma ESM/CJS:
   - Prisma 7 generator cần `moduleFormat = "cjs"` nếu Nest build CommonJS.
   - Sau khi đổi schema phải `npx prisma generate`, xóa `dist`, chạy lại app.
2. Debug Prisma P2002:
   - Debug tại `prisma-error-handler.ts`.
   - `P2002` thường dùng `error.meta.target`, không phải lúc nào là `field_name`.
3. Swagger plugin:
   - Plugin giúp giảm boilerplate DTO.
   - Vẫn cần `@ApiResponse`/custom decorators cho success/error business response.
   - Nested DTO array nên khai báo `@ApiProperty({ type: () => [ChildDto] })`.
4. Attribute:
   - Đã sinh unit test service/controller.
   - Controller test mock service.
   - Service test mock repository.
5. Permission:
   - Giữ abstraction transaction.
   - `TransactionManager` abstract bind qua `PrismaTransactionManager`.
   - Repository nhận `IDatabaseContext`, không nhận `Prisma.TransactionClient` trực tiếp trong service.
   - Đã sinh controller spec.
6. Role:
   - Hoàn thiện CRUD theo pattern permissions.
   - DTO input/output đầy đủ Swagger.
   - `RoleWithPermissionsDto` expose permissions sạch, không raw join row.
   - `RolesRepository` có helper relation-aware.
   - Create/update/delete dùng transaction cho `roles` + `role_permissions`.
   - Update không gửi `permissions` thì giữ nguyên, gửi `permissions: []` thì clear.
7. User:
   - Xây API user cơ bản làm nền auth.
   - Create user hash password bằng Node `crypto.scrypt`.
   - Không expose `hashed_password` hoặc `token_version`.
   - User có roles qua `user_roles`.
   - Create/update role assignment phải atomic.
   - Update password tăng `token_version`.
   - Delete là soft delete: `deletedAt`, `isActive=false`, tăng `token_version`.
   - Search list theo `username` hoặc `displayName`, chỉ lấy `deletedAt: null`.

Lưu ý migration:

- Prisma CLI đang đọc `DATABASE_URL` từ `prisma.config.ts`.
- `.env` cần có:
  `DATABASE_URL="postgresql://admin:your_password_here@localhost:5433/kyc_asset_db?schema=public"`
- Sau đổi schema chạy:
  `npx prisma format`
  `npx prisma migrate dev --name <migration-name>`
  `npx prisma generate`
