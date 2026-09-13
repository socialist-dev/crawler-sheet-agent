/**
 * GOOGLE APPS SCRIPT WEBHOOK ĐA NĂNG
 * - Tự động nhận diện tab tương ứng theo từng tác vụ (Job Edit, Commision, Trending Ideas...)
 * - Tự động tạo tab mới + dòng tiêu đề nếu tab đó chưa có sẵn trên Sheet
 * - Tự động chống trùng lặp theo Link bài gốc (Cột J)
 * - Luôn tự động chèn các bài mới nhất lên trên cùng (Dòng 2)
 */

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const payload = JSON.parse(e.postData.contents);
    
    // Lấy tên tab được gửi từ Engine (mặc định là 'Job Edit, Design')
    const sheetName = payload.sheetName || 'Job Edit, Design';
    let sheet = spreadsheet.getSheetByName(sheetName);

    // 1. TỰ ĐỘNG TẠO TAB & TIÊU ĐỀ NẾU CHƯA TỒN TẠI
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      sheet.appendRow([
        "Thời gian quét",
        "Nền tảng",
        "Thời gian đăng",
        "Phân loại kỹ năng / Tag",
        "Độ tiềm năng / Đánh giá",
        "Tiêu đề",
        "Chi tiết & Yêu cầu / Tóm tắt",
        "Thông tin phụ 1 (Ngân sách / Tác động)",
        "Thông tin phụ 2 (Liên hệ / Tác giả)",
        "Link bài gốc"
      ]);
      sheet.setFrozenRows(1); // Cố định dòng tiêu đề số 1
    }

    const data = payload.jobs;
    // Cột J (cột thứ 10) là Link bài gốc để kiểm tra chống trùng lặp
    const existingUrls = sheet.getRange("J:J").getValues().flat();

    const newRows = [];
    data.forEach(item => {
      // Chỉ lưu các bài có URL chưa từng xuất hiện trên bảng tính
      if (!existingUrls.includes(item.url)) {
        newRows.push([
          item.scanTime,
          item.platform,
          item.postedAgo,
          item.categoryTag,
          item.scoreOrPriority,
          item.title,
          item.contentOrBrief,
          item.extraField1,
          item.extraField2,
          item.url
        ]);
        existingUrls.push(item.url); // Tránh trùng lặp trong cùng một lượt gửi
      }
    });

    // 2. CHÈN TẤT CẢ BÀI MỚI LÊN DÒNG SỐ 2 (DƯỚI TIÊU ĐỀ)
    if (newRows.length > 0) {
      sheet.insertRowsBefore(2, newRows.length);
      sheet.getRange(2, 1, newRows.length, 10).setValues(newRows);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      sheet: sheetName,
      inserted: newRows.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}