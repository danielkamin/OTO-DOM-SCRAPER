import { GoogleSpreadsheet, GoogleSpreadsheetWorksheet } from 'google-spreadsheet';
import chalk from 'chalk';
import inquirer from 'inquirer';
import * as dotenv from 'dotenv';
dotenv.config();

export class GoogleSpreadsheetConnector {
  private _doc: GoogleSpreadsheet | null;
  public get doc() {
    return this._doc;
  }
  private static _googleSheetsControllerInstance: GoogleSpreadsheetConnector;
  private _googleServiceAccountEmail: string | undefined;
  private _googlePrivateKey: string | undefined;
  private _googleSheetId: string | undefined;

  private constructor() {
    this._googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY;
    this._googleServiceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    this._googleSheetId = process.env.GOOGLE_SHEET_ID;
    this._doc = null;
  }

  static async getInstance(): Promise<GoogleSpreadsheetConnector> {
    if (!GoogleSpreadsheetConnector._googleSheetsControllerInstance) {
      GoogleSpreadsheetConnector._googleSheetsControllerInstance = new GoogleSpreadsheetConnector();
    }
    if (!GoogleSpreadsheetConnector._googleSheetsControllerInstance._doc) {
      await GoogleSpreadsheetConnector._googleSheetsControllerInstance.initDoc();
    }
    return GoogleSpreadsheetConnector._googleSheetsControllerInstance;
  }

  public async initDoc(): Promise<GoogleSpreadsheet | null> {
    this._doc = new GoogleSpreadsheet(this._googleSheetId);
    try {
      await this._doc.useServiceAccountAuth({
        client_email: this._googleServiceAccountEmail!,
        private_key: this._googlePrivateKey!,
      });
      await this._doc.loadInfo();
      console.log(chalk.bgGreen('Successfully initialized document!'));
      return this._doc;
    } catch (err: any) {
      err.toJSON ? console.log(chalk.bgRed(err.toJSON())) : console.log(chalk.bgRed(err));
      return null;
    }
  }

  public async checkAndSetConfigConfig(): Promise<void> {
    if (!this._googlePrivateKey) {
      console.log(chalk.bgRed('Missing Google Private Key! Please provide one.'));
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'GOOGLE_PRIVATE_KEY',
          message: 'Enter Google private key',
        },
      ]);
      this._googlePrivateKey = answers['GOOGLE_PRIVATE_KEY'];
    }
    if (!this._googleServiceAccountEmail) {
      console.log(chalk.bgRed('Missing Google Service Accoutn Email! Please provide one.'));
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'GOOGLE_SERVICE_ACCOUNT_EMAIL',
          message: 'Enter Google service account e-mail',
        },
      ]);
      this._googleServiceAccountEmail = answers['GOOGLE_SERVICE_ACCOUNT_EMAIL'];
    }
    if (!this._googleSheetId) {
      console.log(chalk.bgRed('Missing Google Sheet Id! Please provide one.'));
      const answers = await inquirer.prompt([
        {
          type: 'input',
          name: 'GOOGLE_SHEET_ID',
          message: 'Enter Google Sheet Id',
        },
      ]);
      this._googleSheetId = answers['GOOGLE_SHEET_ID'];
    }
  }

  public async getSpreadSheetByTitle(title: string): Promise<GoogleSpreadsheetWorksheet | null> {
    if (!this._doc) return null;

    const sheet = this._doc.sheetsByTitle[title];
    if (sheet) return sheet;
    return await this._doc.addSheet({
      title,
      headerValues: ['miasto', 'data', 'cena', 'typ sprzedaży', 'ilość ogłoszeń'],
    });
  }
}
