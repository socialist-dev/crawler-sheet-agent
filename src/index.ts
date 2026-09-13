import { runTask } from './core/engine';
import { FreelanceJobsTask } from './tasks/freelance-jobs';
import { ArtCommissionTask } from './tasks/art-commission';
import { IdeaMiningTask } from './tasks/idea-mining';

// Tập hợp tất cả các task bạn muốn hệ thống chạy
const REGISTERED_TASKS = [
  FreelanceJobsTask,
  ArtCommissionTask,
  IdeaMiningTask
];

async function main() {
  const keys = {
    jina: process.env.JINA_API_KEY || '',
    firecrawl: process.env.FIRECRAWL_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    sheetUrl: process.env.SHEET_WEBHOOK_URL || ''
  };

  if (!keys.jina || !keys.gemini || !keys.sheetUrl) {
    console.error('❌ Thiếu biến môi trường cấu hình bắt buộc!');
    process.exit(1);
  }

  console.log(`🌟 KHỞI ĐỘNG CRAWLER AGENT ENGINE (${REGISTERED_TASKS.length} tác vụ đã đăng ký)`);

  for (const task of REGISTERED_TASKS) {
    await runTask(task, keys);
  }

  console.log('\n🎉 ĐÃ HOÀN THÀNH TOÀN BỘ CÁC TÁC VỤ!');
}

main();