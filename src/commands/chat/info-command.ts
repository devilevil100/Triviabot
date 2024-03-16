import { ChatInputCommandInteraction, EmbedBuilder, PermissionsString } from 'discord.js';

import { InfoOption } from '../../enums/index.js';
import { Language } from '../../models/enum-helpers/index.js';
import { EventData } from '../../models/internal-models.js';
import { Lang } from '../../services/index.js';
import { InteractionUtils } from '../../utils/index.js';
import { Command, CommandDeferType } from '../index.js';
import { MultipleChoiceQuestion, BooleanQuestion } from 'discord-trivia';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
// Open a SQLite database, stored in the file db.sqlite
const db = await open({
  filename: './mydatabase.db', // Specify the database file
  driver: sqlite3.Database,
});
db.exec('CREATE TABLE IF NOT EXISTS questions ( id INTEGER PRIMARY KEY AUTOINCREMENT, question VARCHAR NOT NULL, answer TEXT NOT NULL, image TEXT NOT NULL, points INTEGER )')

db.exec('CREATE TABLE IF NOT EXISTS points ( id INTEGER PRIMARY KEY AUTOINCREMENT, userid VARCHAR NOT NULL, points INTEGER )')
export class InfoCommand implements Command {
    public names = [Lang.getRef('chatCommands.info', Language.Default)];
    public deferType = CommandDeferType.NONE;
    public requireClientPerms: PermissionsString[] = [];

    public async execute(intr: ChatInputCommandInteraction, data: EventData): Promise<void> {
 
// Load the credentials from the service account key file
	const serviceAccountAuth = new JWT({
  // env var values here are copied from service account credentials generated by google
  // see "Authentication" section in docs for more info
  email: "my-stats-bot@my-stats-bot.iam.gserviceaccount.com",
  key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDN6a+EuGk1u8gw\nD/jHd5ujghJPg5iSxgqsshfVHtKNj9iCPINe0abFLK0rZqp92OXJTmek+0cWrEtd\nNUEOVCmmhe0M7SFyve/wuv4NK7BF31442XxWv7E1PWGeMHmUutNlpqZBfwGRY9T7\nSfNgqATDFVNX1ocBa9FICe3LCAnKs3jRICi7Qcd20u1eCeDltwpS16S87HdBF1qC\nJMdUrmO2R/wQvQNvudZRJmxNjJnbUYjw2Y873DtAeYvNFchlYNJFwZnyTJsTDoQ8\nOLtXfvFMpJtd3zs5ofcqb6/88Z68BYaeKEzm0tLI+J7UbPKxg4G/naA9mraGU06p\nbJVoSjBnAgMBAAECggEAWvBDL3LAKFZ75VoQbYtx5abqzkoYhm3HRhjLNLjNlW57\nWJ1ACY6+v+LowbuwPS8e4KZrWK4O6cEC8bG0vw7FbEFGfUh21rVys9bpn0h1q44o\nDyRh6O/048XtiE7xSxGtjf2o/FEKkLrN04MH5N6fZ8bRzX+1lReYUF/uMJYmuOl5\nbsoEMxXx1UyIHim7N7/u07QHOR5v/xLa7B90RzN1zJE773ul5e1sgkt8BUYl7wfx\nedwkWyxXqVUEArpdRJMDYiyCL45RolzsAKuXTThRswcZOg6/o2G3VcB9ucmiKoST\nyiBInw67p0vqvq/tQQTgxT/5bkAwIezLA15m/8W+gQKBgQD+OCGQrS3qwM6zk0Gv\nG2UYHr9ekeiEvmNxtEmjO3QIq2MZ7q7sz13ZWRFFg+On98EEwLr90kqCvgYgSBlY\nKQtTlRmLh358iiWMz6uE5QALHOVnL3PdijZ/pPOaoKD6V1Mp1wg7NNnaz38A2e0C\n9idHDWOQoDgDbCppZvByrPPogQKBgQDPWu5NSfFFUijiQxcvJ5wHlarvYsNMrK58\n0EIrtmp8FihcROqIhBsrYn6kED6Y7RiMssvPP4YMCvyb478D/20SNOsdUxeXbJai\nvQ5rBKIVpi9qcWI8gveO29e2Jws94ErE6Ra2qm3fiBaaeZyN7AOy7VbHTU7UrRYL\nGdAQuOFk5wKBgHg77AQVJCZnUlu0RdifyEyEHlaIA8TklvvsHPfK4rJG/PQC41C1\nMtndOkH6gu2qS+wHi2kI0JzNavBRqUr8/pJlblODndshK2lRvvl3pXGcFROcadxZ\nxjTQuzZiykAclQSw4v+9m1vVz2eDqolACoucVX7NiDB2NAjt2sMh8aoBAoGBAL6t\nlboJJw9iECqRG37HY9otrbTZE1Ms8H/iWxcrdhyJm6/NyAalxP5OYrqoHYgvb4Xi\n3TzF45SrfcQ02HDqr/gwJY0f3e/ncVZRmDKdXheebLfrcDTJErGSRHlCyjmqSddt\nqO9tJgCKeo6vCmIQCQ6+5i/8TWORj1XB9O2Ltek9AoGBALly1SY3gR9mJN4XquKU\n1/Apoum4CnNW0p+wwZDT4RX0mHdD/AcunYK9wJLcHWRBSmC7AJHUXumDV4Pmge+E\nOkgjQe72ZnG2DA52FbH4JBCiwVeEp/uFPxFmQuX7Xkcn5P13OoXhIk9waz/v5CHq\nCdwjTsJJ+3lHAP0DJG/PQwmk\n-----END PRIVATE KEY-----\n",
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet('1-Ax3VfQ8B2Fpjj3WxQsciOcFHL6UgvrkXxY7VkfaE40', serviceAccountAuth);

await doc.loadInfo(); // loads document properties and worksheets

const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
const rows = await sheet.getRows();


rows.forEach(function (row) {
    var ques = row.get('Question');
    var answer = row.get('Answer');
	var image = row.get('Image');
	var points = row.get('Points');
	
	db.run('DELETE FROM questions');
	db.run('INSERT INTO questions (question,answer,image,points) VALUES (?,?,?,?)',[ques,answer,image,points])
	
	

});
var data2 = db.all('SELECT * FROM questions');
data2.then(user => {

console.log(user)});

    }
}
