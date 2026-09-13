import { TaskDefinition } from './types';
import { searchJina, RawScrapedPost } from './jina';
import { searchFirecrawl } from './firecrawl';
import { batchEvaluateContent, generateDynamicDorks, sleep } from './gemini';
import { exportToGoogleSheet } from './sheet';

export async function runTask(
  task: TaskDefinition,
  keys: { jina: string; firecrawl: string; gemini: string; defaultSheetUrl: string }
) {
  if (!task.enabled) {
    console.log(`⏩ [BỎ QUA TASK] ${task.name} (Đang bị vô hiệu hóa)`);
    return;
  }

  const targetWebhookUrl = (task.webhookEnvVar && process.env[task.webhookEnvVar]) 
    ? process.env[task.webhookEnvVar]! 
    : keys.defaultSheetUrl;

  console.log(`\n======================================================`);
  console.log(`🚀 BẮT ĐẦU TÁC VỤ: [${task.name}]`);
  console.log(`📍 TAB ĐÍCH: [${task.targetSheetTab}] | Lọc: &tbs=${task.timeFilter}`);
  console.log(`======================================================`);

  const rawPosts: RawScrapedPost[] = [];

  // 1. Cào toàn bộ Dorking
  for (const dork of task.dorks) {
    console.log(`🔍 [Jina Search]: ${dork}`);
    const jinaRes = await searchJina(dork, keys.jina, task.timeFilter);
    rawPosts.push(...jinaRes);

    if (keys.firecrawl && jinaRes.length === 0) {
      console.log(`🔥 [Firecrawl Search]: ${dork}`);
      const fcRes = await searchFirecrawl(dork, keys.firecrawl, task.timeFilter);
      rawPosts.push(...fcRes);
    }
    await sleep(500); // Chỉ nghỉ 0.5s giữa các dork
  }

  // 2. Khử trùng URL trước khi đưa vào AI
  let uniquePosts = Array.from(new Map(rawPosts.map(p => [p.url, p])).values());

  // 3. Tự động sinh Dorking nếu ít kết quả
  if (uniquePosts.length < 3 && task.dynamicDorks?.enabled) {
    console.log(`⚡ Kết quả ít (<3). AI đang tự tạo Dorking bổ sung...`);
    const extraDorks = await generateDynamicDorks(task, keys.gemini);
    for (const dork of extraDorks) {
      const res = await searchJina(dork, keys.jina, task.timeFilter);
      rawPosts.push(...res);
    }
    uniquePosts = Array.from(new Map(rawPosts.map(p => [p.url, p])).values());
  }

  console.log(`📌 Gom được tổng cộng ${uniquePosts.length} bài viết thô.`);

  // 4. GOM TOÀN BỘ VÀO 1 LẦN THẨM ĐỊNH AI DUY NHẤT (Batch Call)
  if (uniquePosts.length > 0) {
    const approvedJobs = await batchEvaluateContent(uniquePosts, task, keys.gemini);
    console.log(`🎯 AI đã duyệt ${approvedJobs.length}/${uniquePosts.length} bài chất lượng cao.`);

    for (const job of approvedJobs) {
      console.log(`✅ [${job.postedAgo}] [${job.categoryTag}] [${job.scoreOrPriority}] ${job.title}`);
    }

    // 5. Xuất Google Sheet ngay lập tức
    if (approvedJobs.length > 0) {
      await exportToGoogleSheet(task.targetSheetTab, approvedJobs, targetWebhookUrl);
    }
  } else {
    console.log(`✨ Không cào được bài viết thô nào cho tác vụ [${task.name}].`);
  }
}
