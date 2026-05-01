export const PrismaErrorMessages = {
  // Query errors (P2xxx)
  P2000: (column: string) => `Giá trị nhập vào quá dài cho cột ${column}.`,

  P2001: (model: string, field: string, value: string) =>
    `Không tìm thấy bản ghi ${model} với điều kiện ${field} = ${value}.`,

  P2002: (fields: string, model: string) =>
    `${model} với ${fields} này đã tồn tại.`,

  P2003: (field: string) =>
    `Dữ liệu liên quan (${field}) không hợp lệ hoặc không tồn tại.`,

  P2004: (detail: string) => `Vi phạm ràng buộc cơ sở dữ liệu: ${detail}.`,

  P2005: (field: string, value: string) =>
    `Giá trị "${value}" lưu trong database cho trường ${field} không hợp lệ.`,

  P2006: (model: string, field: string, value: string) =>
    `Giá trị "${value}" cho trường ${field} của ${model} không hợp lệ.`,

  P2007: (model: string) => `Dữ liệu ${model} không hợp lệ.`,

  P2011: (field: string) => `Trường ${field} không được để trống.`,

  P2012: (path: string) => `Thiếu giá trị bắt buộc tại ${path}.`,

  P2013: (arg: string, field: string, object: string) =>
    `Thiếu tham số bắt buộc "${arg}" cho trường ${field} trên ${object}.`,

  P2014: (relation: string, modelA: string, modelB: string) =>
    `Thay đổi vi phạm quan hệ bắt buộc "${relation}" giữa ${modelA} và ${modelB}.`,

  P2015: (detail: string) => `Không tìm thấy bản ghi liên quan: ${detail}.`,

  P2016: (detail: string) => `Lỗi phân tích truy vấn: ${detail}.`,

  P2017: (relation: string, parent: string, child: string) =>
    `Các bản ghi của quan hệ "${relation}" giữa ${parent} và ${child} chưa được kết nối.`,

  P2020: (detail: string) => `Giá trị nằm ngoài phạm vi cho phép: ${detail}.`,

  P2024: (timeout: number, limit: number) =>
    `Hết thời gian chờ kết nối từ connection pool (timeout: ${timeout}ms, limit: ${limit}).`,

  P2025: (model: string) => `Không tìm thấy ${model} yêu cầu.`,

  P2028: (error: string) => `Lỗi Transaction API: ${error}.`,

  P2034: () =>
    `Transaction thất bại do xung đột ghi hoặc deadlock. Vui lòng thử lại.`,
} as const;
