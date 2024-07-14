import { readEmails } from "../services/emailService";
import { runPuppeteer } from "../services/puppeteerService";
import { saveData } from "../services/saveData";

// Função para iniciar a leitura de emails
export const initialReadEmails = async () => {
  const dataEmail = await readEmails();
  const dataProcess = await runPuppeteer(dataEmail);
  saveData(dataProcess);
};
