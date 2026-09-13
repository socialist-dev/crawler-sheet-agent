import { TaskDefinition } from '../core/types';

const NEGATIVE = '-"làm tóc" -makeup -nail -"nối mi" -"may vá" -"chụp ảnh"';

export const FreelanceJobsTask: TaskDefinition = {
  id: 'freelance-jobs',
  name: 'Video Edit & Graphic Design Jobs',
  enabled: true,
  targetSheetTab: 'Job Edit, Design',
  timeFilter: 'qdr:d', // 24 giờ qua
  dorks: [
    `("ai edit được" OR "ai làm được video" OR "cần tìm editor" OR "tuyển freelance video") ("kiểu này" OR "như này" OR "inbox" OR "zalo") ${NEGATIVE}`,
    `("cần designer gấp" OR "tìm thiết kế banner" OR "tuyển người làm thumbnail" OR "cần thuê thiết kế 2d") ${NEGATIVE}`,
    `site:threads.net ("ai nhận edit" OR "ai làm được video" OR "ai edit giùm" OR "cần người làm clip") ${NEGATIVE}`,
    `site:facebook.com/groups ("hổng biết có ai" OR "ai nhận làm" OR "cần editor gấp") ("video này" OR "clip này") ${NEGATIVE}`,
    `site:tiktok.com ("tìm editor" OR "ai nhận edit video" OR "cần người edit reels") ${NEGATIVE}`
  ],
  aiPrompt: {
    systemRole: 'Bạn là chuyên gia thẩm định Job Freelance Video Editing & Graphic Design kỹ thuật số.',
    validationRules: `
    - DUYỆT: Khách cần thuê làm video (CapCut, Premiere, AE, Video AI) hoặc Design (Banner, Thumbnail, Logo, truyện tranh).
    - LOẠI BỎ: Freelancer tự quảng cáo chào dịch vụ HOẶC các dịch vụ đời thực (làm tóc, makeup, nail, may mặc...).
    `,
    categoryTags: ['[Edit Theo Mẫu / TikTok]', '[CapCut / Reels]', '[Premiere / AE]', '[YouTube Editor]', '[Thumbnail / Banner]', '[Video AI]'],
    extraField1Label: 'Ngân sách (Budget)',
    extraField2Label: 'Liên hệ của khách (Contact)'
  },
  dynamicDorks: {
    enabled: true,
    instruction: 'Tạo 3 câu dorking văn nói tiếng Việt tìm người cần thuê edit video hoặc design.'
  }
};