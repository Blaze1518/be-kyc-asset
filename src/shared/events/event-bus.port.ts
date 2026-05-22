// src/shared/events/event-bus.port.ts

export abstract class EventBusPort {
  /**
   * Phát tán sự kiện ra toàn hệ thống
   * @param eventName Tên sự kiện (Ví dụ: 'auth.user.created')
   * @param payload Dữ liệu bất kỳ đi kèm
   */
  abstract publish(eventName: string, payload: any): Promise<void>;
}
