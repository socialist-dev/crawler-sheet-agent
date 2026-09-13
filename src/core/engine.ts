import { TaskDefinition, ExtractedItem } from './types';
import { searchJina, RawScrapedPost } from './jina';
import { searchFirecrawl } from './firecrawl';
import { evaluateContent, generateDynamicDorks, sleep } from './gemini';
import { exportToGoogleSheet } from './sheet';

export async function runTask(
  task: TaskDefinition,
  keys: { jina: string; firecrawl: string; gemini: string; sheetUrl: string }
) {
  if (!task.enabled) {
    console.log(`⏩ [BỎ QUA TASK] ${task.name} (Đang bị vô hiệu hóa)`);
    return;
  }

  console.log(`\n======================================================`);
  console.log(`🚀 BẮT ĐẦU TÁC VỤ: [${task.name}] -> TAB: [${task.targetSheetTab}]`);
  console.log(`======================================================`);

  const rawPosts: RawScrapedPost[] = [];

  // 1. Quét Dorks mặc định
  for (const dork of task.dorks) {
    console.log(`🔍 [Jina Search]: ${dork}`);
    const jinaRes = await searchJina(dork, keys.jina, task.timeFilter);
    rawPosts.push(...jinaRes);

    if (keys.firecrawl && jinaRes.length === 0) {
      console.log(`🔥 [Firecrawl Search]: ${dork}`);
      const fcRes = await searchFirecrawl(dork, keys.firecrawl, task.timeFilter);
      rawPosts.push(...fcRes);
    }
    await sleep(1000);
  }

  let uniquePosts = Array.from(new Map(rawPosts.map(p => [p.url, p])).values());

  // 2. Kích hoạt AI Dynamic Dorks nếu ít kết quả
  if (uniquePosts.length < 3 && task.dynamicDorks?.enabled) {
    console.log(`⚡ Kết quả ít (<3). AI đang tự tạo Dorking bổ sung...`);
    const extraDorks = await generateDynamicDorks(task, keys.gemini);
    for (const dork of extraDorks) {
      const res = await searchJina(dork, keys.jina, task.timeFilter);
      rawPosts.push(...res);
      await sleep(1000);
    }
    uniquePosts = Array.from(new Map(rawPosts.map(p => [p.url, p])).values());
  }

  console.log(`📌 Gom được ${uniquePosts.length} bài. Bắt đầu đưa Gemini thẩm định...`);
  const finalItems: ExtractedItem[] = [];

  // 3. Đưa qua Gemini xử lý tuần tự với delay an toàn
  for (let i = 0; i < uniquePosts.length; i++) {
    const post = uniquePosts[i];
    console.log(`[${i + 1}/${uniquePosts.length}] Thẩm định: ${post.url}`);

    const result = await evaluateContent(post.rawContent, task, keys.gemini);

    if (result && result.isValid && result.isWithinTime) {
      console.log(`✅ [DUYỆT - ${result.postedAgo}] [${result.categoryTag}] ${result.title}`);
      finalItems.push({
        scanTime: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        platform: post.platform,
        postedAgo: result.postedAgo,
        categoryTag: result.categoryTag,
        scoreOrPriority: result.scoreOrPriority,
        title: result.title,
        contentOrBrief: result.contentOrBrief,
        extraField1: result.extraField1,
        extraField2: result.extraField2,
        url: post.url
      });
    } else {
      console.log(`⏩ [BỎ QUA]: ${post.url}`);
    }

    if (i < uniquePosts.length - 1) {
      await sleep(3000); // 3s an toàn 15-20 RPM
    }
  }

  // 4. Xuất Google Sheet
  if (finalItems.length > 0) {
    await exportToGoogleSheet(task.targetSheetTab, finalItems, keys.sheetUrl);
  } else {
    console.log(`✨ Không có dữ liệu mới đạt chuẩn cho tác vụ [${task.name}].`);
  }
}