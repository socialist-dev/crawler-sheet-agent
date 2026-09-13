export interface ExtractedItem {
  scanTime: string;
  platform: string;
  postedAgo: string;
  categoryTag: string;
  scoreOrPriority: string;
  title: string;
  contentOrBrief: string;
  extraField1: string;  // Ngân sách / Tác động / Số liệu
  extraField2: string;  // Liên hệ / Nguồn / Tác giả
  url: string;
}

export interface TaskDefinition {
  id: string;                     // ID duy nhất (vd: 'freelance-jobs')
  name: string;                   // Tên hiển thị
  enabled: boolean;               // Bật/Tắt task
  targetSheetTab: string;         // Tên Tab trên Google Sheets
  timeFilter: 'qdr:h' | 'qdr:d' | 'qdr:w' | 'qdr:m'; // Mốc thời gian
  dorks: string[];                // Danh sách Google Dorking
  aiPrompt: {
    systemRole: string;           // Vai trò của AI
    validationRules: string;      // Tiêu chuẩn duyệt / loại bỏ
    categoryTags: string[];       // Danh mục tag
    extraField1Label: string;     // Nhãn trường phụ 1
    extraField2Label: string;     // Nhãn trường phụ 2
  };
  dynamicDorks?: {
    enabled: boolean;
    instruction: string;
  };
}