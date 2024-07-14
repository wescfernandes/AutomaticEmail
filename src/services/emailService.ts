import { v4 as uuidv4 } from 'uuid';
import { simpleParser } from 'mailparser';
import Imap from 'node-imap';
import fs from 'fs';
import xlsx from 'xlsx';
import moment from 'moment';

const config: Imap.Config = {
  user: 'wescley.fernandes@hotmail.com',
  password: 'Amanh@00',
  host: 'outlook.office365.com',
  port: 993,
  tls: true
};

const currentDate = moment().subtract(1, 'days').format('MMMM D, YYYY');

export async function readEmails(): Promise<any[]> {
  const imap = new Imap(config);

  const openInbox = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.openBox('INBOX', true, (err, box) => {
          if (err) reject(err);
          else resolve();
        });
      });

      imap.once('error', (err) => {
        reject(err);
      });

      imap.connect();
    });
  };

  const searchEmails = (): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      imap.search(['UNSEEN', ['SINCE', currentDate]], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  };

  const fetchEmails = (results: any[]): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const emailsData: any[] = [];
      const fetchStream = imap.fetch(results, { bodies: '' });

      const messagePromises: Promise<void>[] = [];

      fetchStream.on('message', (msg, seqno) => {
        const messagePromise = new Promise<void>((resolveMessage, rejectMessage) => {
          msg.on('body', (stream: any, info) => {
            simpleParser(stream, async (err, parsed) => {
              if (err) {
                rejectMessage(err);
                return;
              }

              if (parsed.attachments.length > 0) {
                for (const attachment of parsed.attachments) {
                  if (attachment.contentType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
                    const filePath = `./${attachment.filename}`;
                    fs.writeFileSync(filePath, attachment.content);
                    const workbook = xlsx.readFile(filePath);
                    const sheetNameList = workbook.SheetNames;

                    for (const sheetName of sheetNameList) {
                      const worksheet = workbook.Sheets[sheetName];
                      const headers: { [key: string]: any } = {};
                      const data: { [key: number]: { [key: string]: any } } = {};

                      for (const cell in worksheet) {
                        if (cell[0] === '!') continue;

                        const row = parseInt(cell.replace(/[^0-9]/g, ''));
                        const col = cell.replace(/[0-9]/g, '');
                        const value = worksheet[cell].v;

                        if (row === 1 && value) {
                          headers[col] = value;
                          continue;
                        }

                        if (!data[row]) data[row] = {};
                        data[row][headers[col]] = value;
                      }

                      Object.keys(data).forEach((key: any) => {
                        emailsData.push({
                          id: uuidv4(),
                          meta: JSON.stringify(data[key]),
                          status: 'EMAIL'
                        });
                      });
                    }
                  }
                }
              }

              resolveMessage();
            });
          });

          msg.once('error', (err) => {
            rejectMessage(err);
          });
        });

        messagePromises.push(messagePromise);
      });

      fetchStream.once('end', () => {
        Promise.all(messagePromises)
          .then(() => resolve(emailsData))
          .catch(reject);
      });

      fetchStream.once('error', (err) => {
        reject(err);
      });
    });
  };

  try {
    await openInbox();
    const results = await searchEmails();
    if (results.length === 0) {
      imap.end();
      return [];
    }
    const emailsData = await fetchEmails(results);
    imap.end();
    return emailsData;
  } catch (err) {
    imap.end();
    throw err;
  }
}