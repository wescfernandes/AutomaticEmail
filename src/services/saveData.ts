import puppeteer from 'puppeteer';
// import { getMongoClient } from './infra/mongoClient';

export async function saveData(processosArray: any) {
    if(processosArray.length == 0){
        return;
    }
    /**
     * Lunch the browser
     */
    for await (const processo of processosArray) {
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
        await page.goto("https://dj25.datajuri.com.br/app/#/auth/login");
        await page.waitForSelector('#mat-input-2');
        await page.type("#mat-input-2", 'wescfernandes@gmail.com', { delay : 120 });
        await page.type("#mat-input-3", 'Amanh@01', { delay : 120 });
        await page.waitForSelector('.submit-button');
        await page.click('.submit-button', {  });

        await new Promise(resolve => setTimeout(resolve, 1000));

        // numero do proceso está gertando automatico, precisamos trocar para o numero do precesso filtrado.
        await page.goto("https://dj25.datajuri.com.br/app/#/lista/Processo/0/cadastro");
        await new Promise(resolve => setTimeout(resolve, 1000));

        // await page.evaluate(() => {
        //     const container = document.getElementsByClassName('mat-ripple content-mostrar row-center-center dj-border-top dj-border-right dj-border-left dj-hover');
        //     if (container) {
        //         (container[0] as HTMLElement).click();
        //     }
        // });
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // quando o tipo do processo for igual a img que tirei o print, não será judicial e sim "Pré-Processual"
        // const inputCaseNumber = await page.$("#pasta.mat-mdc-input-element.ng-tns-c56-84.ng-pristine.ng-valid.mat-mdc-form-field-input-control.mdc-text-field__input.cdk-text-field-autofill-monitored.ng-touched")
        await page.waitForSelector('#pasta');
        await page.click('#pasta', { clickCount: 3 });
        await page.type("#pasta", processo.valueProcessoNumber, { delay : 120 });

        // REVISITAR POIS GERA ERRO EM ALGUNS PROCESSOS
        await page.click('#tipoProcesso');
        await page.type("#tipoProcesso", "Judicial", { delay : 120 });
        await page.waitForSelector('#mat-option-119');
        await page.click('#mat-option-119'); // select the type process

        await page.click('#clientenome');
        await page.type("#clientenome", processo.partes.Reqte.name, { delay : 120 });
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.waitForSelector('#mat-autocomplete-2');
        const optionCount = await page.evaluate(() => {
            const container = document.getElementById('mat-autocomplete-2');
            if (container) {
              const options = container.querySelectorAll('mat-option');
              return options.length;
            } else {
              return 0;
            }
        });


        if (optionCount >= 2) {
            // await page.evaluate(() => {
            //     const container = document.getElementById('mat-autocomplete-2');
            //     if (container) {
            //         const options = container.querySelectorAll('mat-option');
            //         (options[0] as HTMLElement).click();
            //     }
            // });
            await page.evaluate((processo) => {
                console.log(processo)
                const container = document.getElementById('mat-autocomplete-2');
                if (container) {
                    let criarClient = true
                    Array.from(document.querySelectorAll('mat-option')).forEach((item: any) => {
                        if (item.querySelector('span').innerText.trim() == processo.partes.Reqte.name ||
                            item.querySelector('span').innerText.trim() == processo.partes.Reqte.name.toUpperCase()) {
                            criarClient = false
                            item.click();
                        }
                    });

                    if(criarClient) {
                        const options = container.querySelectorAll('mat-option');
                        (options[0] as HTMLElement).click();

                        new Promise(resolve => setTimeout(resolve, 1000));
                        const select: any = document.querySelectorAll("#acao-salvar button");
                        if (select.length > 1) {
                            select[1].click();
                        }
                    }
                }
            }, processo);
        } else {
            await page.evaluate(() => {
                const container = document.getElementById('mat-autocomplete-2');
                if (container) {
                    const options = container.querySelectorAll('mat-option');
                    (options[0] as HTMLElement).click();
                }
            });

            // await page.waitForSelector('.mdc-button mdc-button--raised mat-mdc-raised-button mat-accent mat-mdc-button-base ng-star-inserted');
            await page.evaluate(() => {
                const container = document.getElementsByClassName('mdc-button mdc-button--raised mat-mdc-raised-button mat-accent mat-mdc-button-base ng-star-inserted');
                if (container) {
                    (container[3] as HTMLElement).click();
                }
            });
        }


        await page.click('#mat-select-value-1');
        await page.click('#mat-option-15');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // #advogadoClientenome // Advogado client, sempre o diego e revesar com quem?? ou pegar do reqte

        await page.click('#adversonome');
        await page.type("#adversonome", processo.partes.Reqdo.name, { delay : 120 });
        await new Promise(resolve => setTimeout(resolve, 1000));

        await page.waitForSelector('#mat-autocomplete-5');
        const adverso = await page.evaluate(() => {
            const container = document.getElementById('mat-autocomplete-5');
            if (container) {
              const options = container.querySelectorAll('mat-option');
              return options.length;
            } else {
              return 0;
            }
        });

        if (adverso >= 2) {
            await page.evaluate((processo) => {
                const container = document.getElementById('mat-autocomplete-5');
                if (container) {
                    let criarAdverso = true
                    Array.from(document.querySelectorAll('mat-option')).forEach((item: any) => {
                        if (item.querySelector('span').innerText.trim() == processo.partes.Reqdo.name ||
                        item.querySelector('span').innerText.trim() == processo.partes.Reqdo.name.toUpperCase()) {
                            criarAdverso = false
                            item.click();
                        }
                    });

                    if(criarAdverso) {
                        const options = container.querySelectorAll('mat-option');
                        (options[0] as HTMLElement).click();

                        new Promise(resolve => setTimeout(resolve, 1000));
                        const select: any = document.querySelectorAll("#acao-salvar button");
                        if (select.length > 1) {
                            select[1].click();
                        }
                    }
                }
            }, processo);
        } else {
            await page.evaluate(() => {
                const container = document.getElementById('mat-autocomplete-5');
                if (container) {
                    const options = container.querySelectorAll('mat-option');
                    (options[0] as HTMLElement).click();
                }
            });

            // await page.waitForSelector('.mdc-button mdc-button--raised mat-mdc-raised-button mat-accent mat-mdc-button-base ng-star-inserted');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.evaluate(() => {
                const container: any = document.querySelectorAll("#acao-salvar button");
                if (container.length > 1) {
                    container[1].click();
                }
            });
        }


        // aqui

        // await page.click('#advogadoAdversonome');
        // await page.type("#advogadoAdversonome", obj.partes.Reqdo.attorney, { delay : 120 });
        // await new Promise(resolve => setTimeout(resolve, 1000));

        // await page.waitForSelector('#mat-autocomplete-29');
        // const AdvogadoAdverso = await page.evaluate(() => {
        //     const container = document.getElementById('mat-autocomplete-29');
        //     if (container) {
        //       const options = container.querySelectorAll('mat-option');
        //       return options.length;
        //     } else {
        //       return 0;
        //     }
        // });


        // if (AdvogadoAdverso >= 2) {
        //     await page.evaluate(() => {
        //         const container = document.getElementById('mat-autocomplete-29');
        //         if (container) {
        //             const options = container.querySelectorAll('mat-option');
        //             (options[0] as HTMLElement).click();
        //         }
        //     });
        // } else {
        //     await page.evaluate(() => {
        //         const container = document.getElementById('mat-autocomplete-29');
        //         if (container) {
        //             const options = container.querySelectorAll('mat-option');
        //             (options[0] as HTMLElement).click();
        //         }
        //     });

        //     // await page.waitForSelector('.mdc-button mdc-button--raised mat-mdc-raised-button mat-accent mat-mdc-button-base ng-star-inserted');
        //     await page.evaluate(() => {
        //         const container = document.getElementsByClassName('mdc-button mdc-button--raised mat-mdc-raised-button mat-accent mat-mdc-button-base ng-star-inserted');
        //         if (container) {
        //             (container[3] as HTMLElement).click();
        //         }
        //     });
        // }

        // Espera o elemento "Mostrar mais" aparecer na página
        await page.waitForSelector('.content-mostrar.row-center-center');

        // Clica no elemento
        await page.click('.content-mostrar.row-center-center');

        await page.click('#natureza');
        await page.waitForSelector('#mat-autocomplete-7');
        await page.evaluate(() => {
            const container = document.getElementById('mat-autocomplete-7');
            if (container) {
                Array.from(document.querySelectorAll('mat-option')).forEach((item: any) => {
                    if (item.querySelector('span').innerText.trim() === "Cível") {
                        item.click();
                    }
                });
            }
        });
        // await page.click('#mat-option-146');

        // Navigate to next values tab
        if(processo.partes.Reqte.attorney) {
            await page.click('#advogadoClientenome');
            await page.type("#advogadoClientenome", processo.partes.Reqte.attorney, { delay : 120 });
            await new Promise(resolve => setTimeout(resolve, 1000));

            const advogadoClienteCount = await page.evaluate(() => {
                const container = document.getElementById('mat-autocomplete-6');
                if (container) {
                  const options = container.querySelectorAll('mat-option');
                  return options.length;
                } else {
                  return 0;
                }
            });


            if (advogadoClienteCount >= 2) {
                await page.evaluate((processo) => {
                    console.log(processo.partes.Reqte.attorney)
                    const container = document.getElementById('mat-autocomplete-6');
                    if (container) {
                        let criaradvogadoCliente = true
                        Array.from(document.querySelectorAll('mat-option')).forEach((item: any) => {
                            if (item.querySelector('span').innerText.trim() == processo.partes.Reqte.attorney ||
                            item.querySelector('span').innerText.trim() == processo.partes.Reqte.attorney.toUpperCase()) {
                                criaradvogadoCliente = false
                                item.click();
                            }
                        });

                        if(criaradvogadoCliente) {
                            const options = container.querySelectorAll('mat-option');
                            (options[0] as HTMLElement).click();

                            new Promise(resolve => setTimeout(resolve, 1000));
                            const select: any = document.querySelectorAll("#acao-salvar button");
                            if (select.length > 1) {
                                select[1].click();
                            }
                        }
                    }
                }, processo);
            } else {
                await page.evaluate(() => {
                    const container = document.getElementById('mat-autocomplete-5');
                    if (container) {
                        const options = container.querySelectorAll('mat-option');
                        (options[0] as HTMLElement).click();
                    }
                });

                // await page.waitForSelector('.mdc-button mdc-button--raised mat-mdc-raised-button mat-accent mat-mdc-button-base ng-star-inserted');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await page.evaluate(() => {
                    const container: any = document.querySelectorAll("#acao-salvar button");
                    if (container.length > 1) {
                        container[1].click();
                    }
                });
            }
        }

        if(processo.partes.Reqdo.attorney) {
            await page.click('#advogadoAdversonome');
            await page.type("#advogadoAdversonome", processo.partes.Reqdo.attorney, { delay : 120 });
            await new Promise(resolve => setTimeout(resolve, 1000));

            const advogadoAdversoCount = await page.evaluate(() => {
                const container = document.getElementById('mat-autocomplete-9');
                if (container) {
                  const options = container.querySelectorAll('mat-option');
                  return options.length;
                } else {
                  return 0;
                }
            });


            if (advogadoAdversoCount >= 2) {
                await page.evaluate((processo) => {
                    console.log(processo.partes.Reqdo.attorney)
                    const container = document.getElementById('mat-autocomplete-9');
                    if (container) {
                        let criarAdvogadoAdverso = true
                        Array.from(document.querySelectorAll('mat-option')).forEach((item: any) => {
                            if (item.querySelector('span').innerText.trim() == processo.partes.Reqdo.attorney ||
                            item.querySelector('span').innerText.trim() == processo.partes.Reqdo.attorney.toUpperCase()) {
                                criarAdvogadoAdverso = false
                                item.click();
                            }
                        });

                        if(criarAdvogadoAdverso) {
                            const options = container.querySelectorAll('mat-option');
                            (options[0] as HTMLElement).click();

                            new Promise(resolve => setTimeout(resolve, 1000));
                            const select: any = document.querySelectorAll("#acao-salvar button");
                            if (select.length > 1) {
                                select[1].click();
                            }
                        }
                    }
                }, processo);
            } else {
                await page.evaluate(() => {
                    const container = document.getElementById('mat-autocomplete-9');
                    if (container) {
                        const options = container.querySelectorAll('mat-option');
                        (options[0] as HTMLElement).click();
                    }
                });

                // await page.waitForSelector('.mdc-button mdc-button--raised mat-mdc-raised-button mat-accent mat-mdc-button-base ng-star-inserted');
                await new Promise(resolve => setTimeout(resolve, 1000));
                await page.evaluate(() => {
                    const container: any = document.querySelectorAll("#acao-salvar button");
                    if (container.length > 1) {
                        container[1].click();
                    }
                });
            }
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        await page.waitForSelector('#mat-tab-label-0-1');
        await page.click('#mat-tab-label-0-1');
        await page.waitForSelector('#valorCausa');
        await page.type("#valorCausa", processo.valueAction, { delay : 120 });

        // Espera o elemento "Principais" aparecer na página
        await page.waitForSelector('span.mdc-tab__text-label');

        // Clica no elemento "Principais"
        await page.click('span.mdc-tab__text-label');


        // await page.type("#tipoAcao", 'Amanh@01', { delay : 120 });
        // $('#mat-option-670').click()

        // para preencher o campo advgado, vamos pegar os 5 primeiros processos e depois o 5 irá para o outro advgado que irpa fornecer o nome.


        await page.waitForSelector('#acao-salvarnovafaseprocesso .mdc-button');
        await page.click('#acao-salvarnovafaseprocesso .mdc-button');


        // segundo etapa

        await page.waitForSelector('#tipoFase');
        await page.type("#tipoFase", 'Conhecimento', { delay : 120 });
        await page.click('#tipoFase');

        await page.click('#vara');
        await page.type("#vara", "Vara Cível", { delay : 120 });
        await new Promise(resolve => setTimeout(resolve, 1000));

        await page.waitForSelector('#forum');
        await page.click('#forum');
        await page.type("#forum", processo.valueForum, { delay : 120 });
        await page.click('#acao-salvar button');

        // await page.type("#tipoFase", 'Conhecimento', { delay : 120 });

        //MAKE
        // await page.type("#Data", 'pegar a data do campo Distribuição', { delay : 120 });

        // await page.click('#instancia');
        // await page.click('#mat-option-247');
        // await page.type("#Instância", 'Primeira instancia', { delay : 120 });


        // await page.type("#Nº do processo", 'Pegar o numero do site 1002599-18.2024.8.26.0077', { delay : 120 });


        // await page.type("#Órgão Judicial", 'TJSP ou TJMG', { delay : 120 });
        // await page.type("#Vara", 'pegar dados mongo vara', { delay : 120 });
        // await page.type("#Localidade", 'pegar só o nome    Foro de Birigui', { delay : 120 });
        // await page.type("#Estado", 'conforme a consulta', { delay : 120 });







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
        await browser.close();
    }
}