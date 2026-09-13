import { TaskDefinition } from '../core/types';

export const ArtCommissionTask: TaskDefinition = {
  id: 'art-commission',
  name: '2D Art & Drawing Commission',
  enabled: true,
  targetSheetTab: 'Commision',
  timeFilter: 'qdr:d',
  dorks: [
    '("hổng biết có ai" OR "có ai nhận vẽ" OR "ai vẽ được" OR "bác nào nhận vẽ") ("kiểu này" OR "style này" OR "dạng này" OR "như này")',
    '("cần tìm artist" OR "tìm họa sĩ" OR "cần vẽ commission" OR "cần thuê vẽ oc" OR "tìm người vẽ bìa")',
    '("ai nhận vẽ chibi" OR "tìm người vẽ avatar" OR "cần vẽ minh họa" OR "tìm artist vẽ truyện")',
    'site:threads.net ("cần vẽ comm" OR "tìm artist" OR "ai nhận vẽ" OR "cần vẽ oc" OR "mình cần đặt comm")',
    'site:facebook.com/groups ("cần tìm artist" OR "ai nhận comm" OR "bác nào nhận vẽ" OR "đặt commission") (intext:"budget" OR intext:"giá" OR intext:"inbox")'
  ],
  aiPrompt: {
    systemRole: 'Bạn là chuyên gia thẩm định nhu cầu Đặt Vẽ Tranh 2D & Art Commission.',
    validationRules: `
    - DUYỆT: Khách hàng cần tìm Artist đặt vẽ tranh 2D (OC, Chibi, Bìa sách, Avatar, Webtoon, Mascot, Fanart...).
    - LOẠI BỎ: Artist tự đăng bài mở slot commission chào bán dịch vụ hoặc bài khoe tranh.
    `,
    categoryTags: ['[Vẽ Chibi / Avatar]', '[Character / OC Design]', '[Vẽ Minh Họa / Bìa Sách]', '[Mascot / 2D Game]', '[Webtoon / Comic]', '[Anime / Fanart Style]'],
    extraField1Label: 'Ngân sách đặt vẽ',
    extraField2Label: 'Liên hệ người đặt'
  }
};