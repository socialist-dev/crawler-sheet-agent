import { ExtractedItem } from './types';

export async function exportToGoogleSheet(sheetName: string, items: ExtractedItem[], webhookUrl: string): Promise<void> {
  if (!webhookUrl || items.length === 0) return;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetName: sheetName,
        jobs: items
      })
    });
    const result = await res.text();
    console.log(`📊 [Google Sheet] Đã chèn ${items.length} dòng vào tab [${sheetName}]:`, result);
  } catch (err) {
    console.error(`[Google Sheet] Lỗi xuất dữ liệu tab [${sheetName}]:`, err);
  }
}