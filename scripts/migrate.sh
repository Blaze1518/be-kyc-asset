#!/bin/sh

# 1. Tự động load biến môi trường từ file .env (nếu chạy local)
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
elif [ -f ../.env ]; then
  export $(grep -v '^#' ../.env | xargs)
fi

# 2. Hàm kiểm tra biến môi trường
check_env() {
  var_name=$1
  eval var_value=\$$var_name
  if [ -z "$var_value" ]; then
    echo "Lỗi: Biến $var_name không có trong .env!"
    exit 1
  fi
}

# Kiểm tra theo đúng tên biến trong file .env của bạn
check_env "DB_USERNAME"
check_env "DB_PASSWORD"
check_env "DB_HOST"
check_env "DB_PORT"
check_env "DB_DATABASE"

echo "--- Đang khởi tạo cấu hình migration cho: $APP_NAME ---"

# 3. Encode password bằng Node.js (Xử lý các ký tự đặc biệt trong mật khẩu)
# Lưu ý: Truyền trực tiếp biến DB_PASSWORD vào môi trường của node
ENCODED_PASS=$(DB_PASSWORD="$DB_PASSWORD" node -e "console.log(encodeURIComponent(process.env.DB_PASSWORD))")

# 4. Ghép chuỗi kết nối chuẩn Prisma
# Sử dụng các biến khớp với file .env
export DATABASE_URL="postgresql://$DB_USERNAME:$ENCODED_PASS@$DB_HOST:$DB_PORT/$DB_DATABASE?schema=public"

echo "Chuỗi kết nối: postgresql://$DB_USERNAME:******@$DB_HOST:$DB_PORT/$DB_DATABASE"

# 5. Wait-for-DB (Kiểm tra kết nối tới Database)
echo "Đang đợi Database tại $DB_HOST:$DB_PORT sẵn sàng..."
until node -e "const net = require('net'); const client = net.createConnection({host: '$DB_HOST', port: $DB_PORT}, () => { client.end(); process.exit(0); }); client.on('error', () => process.exit(1));" ; do
  echo "Database chưa sẵn sàng - đang thử lại sau 2 giây..."
  sleep 2
done

echo "Database đã thông kết nối!"

# 6. Chạy Migration
if [ "$NODE_ENV" = "production" ]; then
  echo "Chế độ PRODUCTION: Đang chạy migrate deploy..."
  npx prisma migrate deploy
else
  echo "Chế độ DEVELOPMENT: Đang chạy migrate dev..."
  # Tạo migration tự động với timestamp để không bị hỏi tên (interactive prompt)
  npx prisma migrate dev --name "auto_$(date +%Y%m%d_%H%M%S)"
fi

# 7. Generate Prisma Client (để NestJS dùng được ngay)
# npx prisma generate
