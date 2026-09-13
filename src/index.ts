import { runTask } from './core/engine';
import { FreelanceJobsTask } from './tasks/freelance-jobs';
import { ArtCommissionTask } from './tasks/art-commission';

// Chỉ đăng ký 2 task đang sử dụng thực tế
const REGISTERED_TASKS = [
  FreelanceJobsTask,
  ArtCommissionTask
];

async function main() {
  const keys = {
    jina: process.env.JINA_API_KEY || '',
    firecrawl: process.env.FIRECRAWL_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    defaultSheetUrl: process.env.SHEET_WEBHOOK_URL || ''
  };

  if (!keys.jina || !keys.gemini || !keys.defaultSheetUrl) {
    console.error('❌ Thiếu biến môi trường cấu hình bắt buộc!');
    process.exit(1);
  }

  console.log(`🌟 KHỞI ĐỘNG CRAWLER AGENT ENGINE (${REGISTERED_TASKS.length} tác vụ đang chạy)`);

  for (const task of REGISTERED_TASKS) {
    await runTask(task, keys);
  }

  console.log('\n🎉 ĐÃ HOÀN THÀNH TOÀN BỘ CÁC TÁC VỤ!');
}

main();
