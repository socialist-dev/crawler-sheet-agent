# 🤖 SKILL & SPECIFICATION: UNIVERSAL CRAWLER AGENT

## 1. MỤC ĐÍCH HỆ THỐNG
Hệ thống này là một Agent Framework tự động hóa trên GitHub Actions:
1. Thu thập dữ liệu thời gian thực bằng Google Dorking qua Jina Search và Firecrawl.
2. Thẩm định, làm sạch, phân loại và chấm điểm bằng Gemini 3.1 Flash Lite.
3. Xuất kết quả đã cấu trúc vào từng Tab tương ứng trên Google Sheets.

## 2. QUY CHUẨN KIẾN TRÚC
- **Core Engine (`src/core/`)**: Lõi hệ thống bất biến. KHÔNG sửa đổi các file trong thư mục này trừ khi nâng cấp hạ tầng.
- **Tasks (`src/tasks/`)**: Nơi tạo các tác vụ độc lập. Mỗi tác vụ là một file xuất ra một đối tượng `TaskDefinition`.

## 3. QUY TRÌNH TẠO MỘT TASK MỚI (BEST PRACTICES)
Khi tạo một task mới trong `src/tasks/<task-name>.ts`, phải tuân thủ chuẩn `TaskDefinition`:

```typescript
import { TaskDefinition } from '../core/types';

export const MyNewTask: TaskDefinition = {
  id: 'my-unique-task-id',
  name: 'Tên tác vụ',
  enabled: true,
  targetSheetTab: 'Tên Tab Google Sheet',
  timeFilter: 'qdr:d', // 'qdr:h' (1h), 'qdr:d' (24h), 'qdr:w' (7 ngày), 'qdr:m' (1 tháng)
  dorks: [
    // Viết các câu Google Dorking bao gồm cả văn nói, teen-code và từ phủ định (-)
  ],
  aiPrompt: {
    systemRole: 'Mô tả vai trò thẩm định viên...',
    validationRules: `
      - DUYỆT: Điều kiện chấp nhận bài viết.
      - LOẠI BỎ: Điều kiện gạt bỏ bài viết (quảng cáo, rác, dịch vụ ngoài đời...).
    `,
    categoryTags: ['[Tag 1]', '[Tag 2]', '[Tag 3]'],
    extraField1Label: 'Ý nghĩa cột H trên Sheet (vd: Ngân sách, Mức độ hot)',
    extraField2Label: 'Ý nghĩa cột I trên Sheet (vd: Liên hệ, Tác giả)'
  },
  dynamicDorks: {
    enabled: true,
    instruction: 'Hướng dẫn cho Gemini tự sinh thêm dorking khi cạn kết quả...'
  }
};