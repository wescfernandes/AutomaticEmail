import puppeteer from 'puppeteer';
import { getMongoClient } from './infra/mongoClient';

export async function runPuppeteer(dataEmail: any) {
    /**
     * Lunch the browser
     */
    const browser = await puppeteer.launch(
        { 
            headless : false, 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
    const page = (await browser.pages())[0];

    //#region tjsp.jus.br

    /**
     * Go to page login
     */
    console.log(dataEmail);
    await page.goto("https://esaj.tjsp.jus.br/sajcas/login?service=https%3A%2F%2Fesaj.tjsp.jus.br%2Fesaj%2Fj_spring_cas_security_check");
    await page.type("#usernameForm", '35353972864', { delay : 120 });
    await page.type("#passwordForm", '110405di', { delay : 120 });
    await page.click('#pbEntrar');


    await page.waitForSelector('#confirmarDados');
    await page.click('#confirmarDados')

    await page.waitForSelector('.esajTituloPagina');
     /**
     * [END] - Go to page login
     */
     
    const processosArray = []

    for await (const processo of dataEmail) {
        const { ORGAO_JULGADOR, Expr1 } = JSON.parse(processo.meta)

        if (ORGAO_JULGADOR.includes('SP') && Expr1.length === 20) {
            /**
            * Go to page SEARCH
            */
            await page.goto("https://esaj.tjsp.jus.br/cpopg/open.do?gateway=true");
            // await page.type("#numeroDigitoAnoUnificado", '1002599182024', { delay : 120 });
            // await page.type("#foroNumeroUnificado", '0077', { delay : 120 });
            await page.type("#numeroDigitoAnoUnificado", Expr1.substring(0, 13), { delay : 120 });
            await page.type("#foroNumeroUnificado", Expr1.substring(16), { delay : 120 });
            await page.click('#botaoConsultarProcessos');
    
            await page.waitForSelector('.subtitle.tituloDoBloco');
    
            await page.click('#botaoExpandirDadosSecundarios');
            /**
             * [END] - Go to page SEARCH
            */

            /**
             * Get values
             */
            // const caseNumber = await page.$('#numeroProcesso'); //???
            const subject = await page.$('#assuntoProcesso'); //???
            const forum = await page.$('#foroProcesso'); //???
            const stick = await page.$('#varaProcesso'); //????
            const allElement = await page.$('#tablePartesPrincipais');
            const action = await page.$('#valorAcaoProcesso');
    
            const partes: any = await page.evaluate(() => {
                // Seleciona as linhas da tabela
                const rows = Array.from(document.querySelectorAll('#tablePartesPrincipais tr.fundoClaro'));
    
                // Cria um objeto para armazenar os resultados
                const result: any = {
                    Reqte: { name: null, attorney: null },
                    Reqdo: { name: null, attorney: null },
                };
    
                // Itera pelas linhas e extrai os valores desejados
                rows.forEach(row => {
                    const tipoDeParticipacao = row.querySelector('.tipoDeParticipacao')?.textContent?.trim();
                    const nomeParteNode = row.querySelector('.nomeParteEAdvogado')?.childNodes[0]; // First name
                    const advogado = row.querySelector('.nomeParteEAdvogado')?.childNodes[4];
                    const nomeParte = nomeParteNode?.nodeType === Node.TEXT_NODE ? nomeParteNode.nodeValue?.trim() : null;
                    const nomeadvogado = advogado?.nodeType === Node.TEXT_NODE ? advogado.nodeValue?.trim() : null;
    
                    if (tipoDeParticipacao?.includes('Reqte') && nomeParte) {
                        result.Reqte.name = nomeParte;
                        result.Reqte.attorney = nomeadvogado;
                    } else if (tipoDeParticipacao?.includes('Reqdo') && nomeParte) {
                        result.Reqdo.name = nomeParte;
                        result.Reqdo.attorney = nomeadvogado;
                    }
                });
    
                return result;
            });
    
            // const valueCaseNumber = await page.evaluate(element => element === null || element === void 0 ? void 0 : element.textContent, caseNumber);
            const valueSubject = await page.evaluate(element => element?.textContent, subject);
            const valueForum = await page.evaluate(element => element?.textContent, forum);
            const valueStick = await page.evaluate(element => element?.textContent, stick);
            // let valueALL = await page.evaluate(element => element?.textContent, allElement);
    
            const valueAction = await page.evaluate(element => element?.textContent, action);
            
            // console.log(valueSubject, valueForum, valueStick, valueALL, valueAction);
            let obj = {
                valueProcessoNumber: Expr1,
                valueSubject,
                valueForum,
                valueStick,
                partes,
                valueAction
            };

            processosArray.push(obj)
        }
    }

    await browser.close();

    return processosArray;

    // try {

    // const maggieDb = await getMongoClient();
    // const collection = maggieDb.collection<any>("legalprocess");

    // await collection.save(JSON.stringify(obj));

    // // await collection.updateOne({ _id: '123' }, { $set: JSON.stringify(obj) }, { upsert: true } );

    // const legalprocess = await collection
    // .find()
    // .toArray();

    // console.log(legalprocess);
    
    // }
    // catch (error) {
    //     console.log
    // }

    /**
     * [END] - Get values
    */

    //#endregion

    // //#region pje.tjmg.jus.br

    // /**
    //  * Go to page login
    //  */
    // // await page.goto("https://pje.tjmg.jus.br/pje/login.seam");
    // // await page.type("#username", '35353972864', { delay : 120 });
    // // await page.type("#password", '110405di', { delay : 120 });
    // // await page.click('#kc-form-buttons', { delay : 120 });

    //  /**
    //  * [END] - Go to page login
    //  */
     

    // /**
    // * Go to page SEARCH
    // */
    // // await page.goto("https://pje.tjmg.jus.br/pje/Processo/ConsultaProcesso/listView.seam");
    // await page.goto("https://pje-consulta-publica.tjmg.jus.br/");
    

    // await page.waitForSelector('#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso');

    // // Pega o elemento pelo seu ID usando o método $$
    // const inputNumeroProcesso = await page.$('#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso');

    // await page.evaluate(() => {
    //     const element = document.querySelector('#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso') as HTMLInputElement;
    //     if (element) {
    //         element.value = '50016406520228130479';
    //     }
    // });    
    // // await page.type('#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso', '5001640-65.2022.8.13.0479');
    // // await inputNumeroProcesso?.type('5001640-65.2022.8.13.0479');

    // console.log(inputNumeroProcesso);

    // await page.click('#fPP\\:searchProcessos');
    // await page.waitForSelector('a[title="Ver Detalhes"]');
    // await page.click('a[title="Ver Detalhes"]');
    // /**
    //  * [END] - Go to page SEARCH
    // */


    // /**
    // * Get values
    // */
    // // const subject = await page.$('#assuntoProcesso');
    // // const forum = await page.$('#foroProcesso');
    // // const stick = await page.$('#varaProcesso');
    // // const allElement = await page.$('.fundoClaro');
    // // const action = await page.$('#valorAcaoProcesso');

    // // const valueSubject = await page.evaluate(element => element?.textContent, subject);
    // // const valueForum = await page.evaluate(element => element?.textContent, forum);
    // // const valueStick = await page.evaluate(element => element?.textContent, stick);
    // // const valueALL = await page.evaluate(element => element?.textContent, allElement);
    // // const valueAction = await page.evaluate(element => element?.textContent, action);
    
    // // console.log(valueSubject, valueForum, valueStick, valueALL, valueAction);

    // /**
    //  * [END] - Get values
    // */


    // //#endregion
}