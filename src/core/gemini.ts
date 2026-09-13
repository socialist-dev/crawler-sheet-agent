import { TaskDefinition } from './types';

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AIAnalysisResult {
  isValid: boolean;
  isWithinTime: boolean;
  postedAgo: string;
  categoryTag: string;
  scoreOrPriority: string;
  title: string;
  contentOrBrief: string;
  extraField1: string;
  extraField2: string;
}

export async function evaluateContent(
  rawContent: string,
  task: TaskDefinition,
  geminiKey: string,
  retries = 3
): Promise<AIAnalysisResult | null> {
  const MODEL = 'gemini-3.1-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${geminiKey}`;

  const now = new Date();
  const todayVN = now.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const prompt = `
${task.aiPrompt.systemRole}
HÔM NAY LÀ NGÀY: ${todayVN} (Giờ Việt Nam).

=== DỮ LIỆU CÀO ĐƯỢC ===
${rawContent}
========================

QUY TẮC THẨM ĐỊNH CHO TÁC VỤ [${task.name}]:
${task.aiPrompt.validationRules}

TIÊU CHÍ BẮT BUỘC:
1. LỌC THỜI GIAN: So sánh với ngày HÔM NAY (${todayVN}). Nếu bài viết có ngày đăng cũ hơn mốc thời gian quy định (tháng trước, năm ngoái...) -> Đặt "isWithinTime = false".
2. PHÂN LOẠI TAG: Chọn tag phù hợp nhất từ danh sách: [${task.aiPrompt.categoryTags.join(', ')}].
3. TRƯỜNG THÔNG TIN PHỤ:
   - extraField1 (${task.aiPrompt.extraField1Label}): Trích xuất chính xác.
   - extraField2 (${task.aiPrompt.extraField2Label}): Trích xuất chính xác.
`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                isValid: { type: 'BOOLEAN' },
                isWithinTime: { type: 'BOOLEAN' },
                postedAgo: { type: 'STRING' },
                categoryTag: { type: 'STRING' },
                scoreOrPriority: { type: 'STRING' },
                title: { type: 'STRING' },
                contentOrBrief: { type: 'STRING' },
                extraField1: { type: 'STRING' },
                extraField2: { type: 'STRING' }
              },
              required: ['isValid', 'isWithinTime', 'postedAgo', 'categoryTag', 'scoreOrPriority', 'title', 'contentOrBrief', 'extraField1', 'extraField2']
            }
          }
        })
      });

      if (response.status === 503 || response.status === 429) {
        const waitTime = attempt * 4000;
        console.warn(`[Gemini] Quá tải (${response.status}). Thử lại sau ${waitTime / 1000}s...`);
        await sleep(waitTime);
        continue;
      }

      if (!response.ok) return null;

      const data = (await response.json()) as any;
      const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonText) return null;

      const result = JSON.parse(jsonText) as AIAnalysisResult;

      // Lớp chặn cứng ngày tháng cũ
      const lower = (result.postedAgo || '').toLowerCase();
      const currentYear = now.getFullYear().toString();
      if (
        (lower.includes('tháng') && !lower.includes('trước')) ||
        lower.includes('month') ||
        lower.includes('tuần trước') ||
        lower.includes('weeks ago') ||
        (lower.match(/202[0-5]/) && !lower.includes(currentYear))
      ) {
        result.isWithinTime = false;
      }

      return result;
    } catch {
      if (attempt === retries) return null;
      await sleep(3000);
    }
  }
  return null;
}

export async function generateDynamicDorks(task: TaskDefinition, geminiKey: string): Promise<string[]> {
  if (!task.dynamicDorks?.enabled) return [];
  const MODEL = 'gemini-3.1-flash-lite';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${geminiKey}`;

  const prompt = `
Hãy tạo 3 câu Google Dorking nâng cao dựa trên yêu cầu sau:
${task.dynamicDorks.instruction}
Trả về mảng JSON 3 chuỗi: ["dork 1", "dork 2", "dork 3"]
`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
    const data = (await res.json()) as any;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? JSON.parse(text) : [];
  } catch {
    return [];
  }
}