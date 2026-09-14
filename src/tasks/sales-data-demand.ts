import { TaskDefinition } from '../core/types';

// Từ khóa loại trừ các bài rao bán data rác / spam dịch vụ không có giá trị nghiên cứu
const NEGATIVE = '-"bán data số lượng lớn" -"bán data bđs 2024" -"nhận chạy quảng cáo"';

export const SalesDataDemandTask: TaskDefinition = {
  id: 'sales-data-demand',
  name: 'Nghiên cứu Nhu cầu Tool Data & Lead Generation của Sale',
  enabled: true,
  targetSheetTab: 'Sales Data Demand', // Tên Tab mới trên Google Sheet
  timeFilter: 'qdr:w', // Lấy dữ liệu trong 7 ngày qua để bắt trọn các thảo luận chuyên sâu
  dorks: [
    // 1. Dạng hỏi xin / tìm kiếm Tool quét Data & SĐT
    `("có tool nào" OR "xin tool" OR "ai có tool" OR "phần mềm nào") ("quét data" OR "cào data" OR "lấy số điện thoại" OR "quét sđt" OR "tìm data") ${NEGATIVE}`,
    
    // 2. Dạng hỏi cách kiếm Data theo từng ngành (BĐS, Tài chính, Bảo hiểm, B2B)
    `("kiếm data kiểu gì" OR "lấy data khách ở đâu" OR "cách tìm data khách hàng" OR "tìm data bđs") ("chỉ em với" OR "bác nào biết" OR "xin kinh nghiệm" OR "có tool") ${NEGATIVE}`,

    // 3. Dạng tìm Tool quét từ các nền tảng cụ thể (Facebook, Google Maps, Shopee, TikTok)
    `("tool quét google maps" OR "tool quét group facebook" OR "phần mềm cào data" OR "tool lấy sđt trên web" OR "tool cào lead") ("có ai dùng" OR "xin review" OR "ai bán" OR "dùng cái nào ngon") ${NEGATIVE}`,

    // 4. Săn lùng trên Threads & Facebook Group (Nơi dân Sale hay tâm sự nỗi đau thiếu data)
    `site:threads.net ("tool quét data" OR "kiếm data sale" OR "lấy data khách hàng" OR "cào sđt" OR "tool tìm khách") ${NEGATIVE}`,
    `site:facebook.com/groups ("có tool nào quét" OR "xin phần mềm quét data" OR "ai có data khách" OR "cách cào data") (intext:"bđs" OR intext:"sale" OR intext:"bảo hiểm" OR intext:"inbox") ${NEGATIVE}`,

    // 5. Diễn đàn công nghệ & kinh doanh (Voz, Spiderum, Reddit)
    `site:voz.vn ("tool cào data" OR "phần mềm quét sđt" OR "cào lead" OR "tool lấy data maps") ${NEGATIVE}`
  ],
  aiPrompt: {
    systemRole: 'Bạn là chuyên gia nghiên cứu thị trường (Market Research) & phân tích nhu cầu phần mềm (SaaS / Data Scraping Tools) cho giới Sales & Marketing.',
    validationRules: `
    - TIÊU CHÍ DUYỆT ("isValid = true"):
      + Bài viết/bình luận từ Sales, Doanh chủ, Marketer bộc lộ NỖI ĐAU THIẾU DATA, hỏi tìm tool/phần mềm quét SĐT/Email, tìm cách tự động hóa cào dữ liệu (từ Google Maps, Facebook Group/Fanpage, Web, E-commerce).
      + Các bài hỏi xin giải pháp, hỏi mua tool cào lead hoặc thảo luận về việc tìm kiếm khách hàng tiềm năng.
    - TIÊU CHÍ LOẠI BỎ ("isValid = false"):
      + Người bán data rác ("Bán 10.000 số điện thoại BĐS...", "Kho data giá rẻ...").
      + Bài spam quảng cáo dịch vụ tăng like/sub không liên quan đến data.
    `,
    categoryTags: [
      '[Cần Tool Quét SĐT / Email]',
      '[Cần Tool Quét Google Maps]',
      '[Cần Tool Quét Facebook Group / Page]',
      '[Nỗi Đau Tìm Lead BĐS / Tài Chính]',
      '[Cần Tool Cào Web / E-Commerce]',
      '[Thảo Luận / Hỏi Giải Pháp Data]'
    ],
    extraField1Label: 'Ngành nghề & Nỗi đau cụ thể (Pain Point / Niche)',
    extraField2Label: 'Mức độ sẵn sàng trả phí / Liên hệ tác giả (Intent & Contact)'
  },
  dynamicDorks: {
    enabled: true,
    instruction: 'Tạo 3 câu Google Dorking văn nói tiếng Việt tìm kiếm dân sale đang kêu ca về việc thiếu data hoặc hỏi phần mềm tự động quét khách hàng tiềm năng.'
  }
};
