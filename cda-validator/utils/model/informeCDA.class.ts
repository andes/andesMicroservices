import * as fs from 'fs';
import * as path from 'path';
import * as scss from 'node-sass';
import * as pdf from 'html-pdf';
import { HTMLComponent } from './html-component.class';
import { userScheduler } from '../../config.private';
import { msCDAValidatorLog } from '../../logger/msCDAValidator';
const log = msCDAValidatorLog.startTrace();

export class InformeCDAPDF extends HTMLComponent {
    template = `
    <!DOCTYPE html>
    <html>
        <head>
            {{#if css }}
                <style> {{{ css }}}  </style>
            {{/if}}
        </head>
        <body class="body-with-margin">
            {{#if header }}
                <header id="pageHeader"> {{{ header }}}  </header>
            {{/if}}
            {{{ body }}}

            {{#if footer }}
                <footer id="pageFooter"> {{{ footer }}} </footer>
            {{/if}}
        </body>
    </html>`;

    header: HTMLComponent;
    body: HTMLComponent;
    footer: HTMLComponent;

    style: string;
    stylesUrl: string[];


    async informe(options: pdf.CreateOptions = null) {
        const opciones = {
            ...this.getDefaultOptions(),
            ...(options || {})
        };
        const html = await this.render();
        return new Promise((resolve, reject) => {
            try {
                pdf.create(html, opciones).toFile((err, file) => {
                    if (err) {
                        log.error('guardia:informe:pdf_toFile', { err }, err.message, userScheduler);
                        return reject(err);
                    }
                    return resolve(file.filename);
                });
            } catch (err) {
                log.error('guardia:informe:pdf_create', { err }, err.message, userScheduler);
            }
        });
    }


    public async process() {
        const data: any = {};
        if (this.header) {
            data.header = await this.header.render();
        }
        if (this.footer) {
            data.footer = await this.footer.render();
        }
        data.body = await this.body.render();

        if (this.style) {
            data.css = this.style;
        } else if (this.stylesUrl?.length > 0) {
            data.css = this.renderSCSS();
        }
        this.data = data;
    }

    private renderSCSS() {
        const styles = this.stylesUrl.map((file) => {
            return scss.renderSync({
                file
            }).css;
        });

        return styles.join('\n');
    }

    private getDefaultOptions() {
        const defaultOptions: pdf.CreateOptions = {
            format: 'A4',
            border: {
                top: '.25cm',
                right: '0cm',
                bottom: '0cm',
                left: '0cm'
            },
            header: {
                height: '2cm',
            },
            footer: {
                height: '2cm'
            }
        };
        return defaultOptions;
    }


}

export function getAssetsURL(filename) {
    return path.join(process.env.CDA_PATH, filename);
}

export function loadImage(filename) {
    const realPath = path.join(process.env.CDA_PATH, filename);
    const image = fs.readFileSync(realPath);
    return image.toString('base64');
}