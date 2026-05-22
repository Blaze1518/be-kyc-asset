import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 🎯 CHIẾN LƯỢC MỚI: Thử thách cụm 4 Instances NestJS + Nginx Load Balancer ở mốc 6000 VUs
  stages: [
    { duration: '1m', target: 6000 }, // 1 phút đầu: Leo thang từ từ lên 6000 users để Nginx chia bài ổn định
    { duration: '40s', target: 6000 }, // 40 giây tiếp theo: Giữ cứng đỉnh 6000 users để đo sức bền Cluster
    { duration: '15s', target: 0 }, // 15 giây cuối: Hạ tải nhanh về 0
  ],
  thresholds: {
    // Với 4 họng súng gánh tải, tỷ lệ lỗi mạng bắt buộc phải rất thấp.
    // Nếu tỷ lệ lỗi vượt quá 5% (rate >= 0.05) chứng tỏ đã chạm giới hạn phần cứng máy local, tự động ngắt test.
    http_req_failed: [
      {
        threshold: 'rate<0.05',
        abortOnFail: true,
        delayAbortEval: '10s', // Chờ 10 giây đầu để thu thập đủ dữ liệu mẫu trước khi đánh giá
      },
    ],
  },
};

export default function () {
  const url = 'http://host.docker.internal:3001/api/v1/auth/me';

  const params = {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      // ⚠️ Hãy chắc chắn access_token này vẫn còn hạn trước khi bạn bấm cả 2 bài test
      Cookie:
        'access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRjZmVhYTZmLTM3MDgtNDdiYy1iOWQ1LTBlMTNlNWUwNTNmZiIsInRva2VuVmVyc2lvbiI6MSwiaWF0IjoxNzc5NDU5NjcyLCJleHAiOjE3Nzk0NjA1NzJ9.R1-mVZyJ1vtQeQ6ZZpjHEm560lclTOocCMbxJphpRmc',
    },
  };

  const res = http.get(url, params);

  if (res.status !== 200) {
    console.log(`[CẢNH BÁO] Status: ${res.status} | Body: ${res.body}`);
  }

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Đưa về sleep(0.01) để ép xung tối đa năng lực phản hồi của RAM Redis
  sleep(0.01);
}
