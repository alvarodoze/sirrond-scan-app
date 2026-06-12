/**
 * Sirrond → Google Sheets connector
 * One tab per student. Each tab: Field | Value rows.
 *
 * Setup: Extensions → Apps Script → paste → Deploy as Web app (Anyone)
 */

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = uniqueSheetName(ss, payload.sheetName || "Unknown");
  const sheet = ss.insertSheet(sheetName);
  const rows = payload.rows;

  if (!rows || rows.length === 0) {
    throw new Error("No rows in payload");
  }

  sheet.getRange(1, 1, rows.length, 2).setValues(rows);
  sheet.setColumnWidth(1, 220);
  sheet.setColumnWidth(2, 360);
  sheet.getRange(1, 1, 1, 2).setFontWeight("bold");

  return ContentService.createTextOutput(JSON.stringify({ ok: true, sheet: sheetName }))
    .setMimeType(ContentService.MimeType.JSON);
}

function uniqueSheetName(ss, desired) {
  var base = String(desired)
    .replace(/[:\\/?*[\]]/g, "")
    .trim()
    .substring(0, 31) || "Unknown";
  var name = base;
  var n = 2;
  while (ss.getSheetByName(name)) {
    var suffix = " (" + n + ")";
    name = base.substring(0, Math.max(1, 31 - suffix.length)) + suffix;
    n++;
  }
  return name;
}

/** Run once from editor to test — creates a tab "Test Student" */
function testAppend() {
  doPost({
    postData: {
      contents: JSON.stringify({
        sheetName: "Test Student",
        rows: [
          ["Field", "Value"],
          ["Submitted at", new Date().toLocaleString()],
          ["Source", "test"],
          ["School", "Clarion"],
          ["Student name", "Test Student"],
          ["DOB", "01/01/2010"],
        ],
      }),
    },
  });
}
