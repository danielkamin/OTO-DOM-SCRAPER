import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
let doc: GoogleSpreadsheet;
export const initDoc = async (): Promise<GoogleSpreadsheet | null> => {
  doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  try {
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    });
    await doc.loadInfo();
    return doc;
  } catch (err) {
    err.toJSON ? console.log(err.toJSON()) : console.log(err);
    return null;
  }
};

export const getSpreadSheetByTitle = async (title: string): Promise<GoogleSpreadsheetWorksheet> => {
  const sheet = doc.sheetsByTitle[title];
  if (sheet) return sheet;
  return await doc.addSheet({
    title,
    headerValues: ['miasto', 'data', 'cena', 'typ sprzedaży', 'ilość ogłoszeń'],
  });
};
