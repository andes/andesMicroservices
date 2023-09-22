import { readFileSync } from 'fs';
import { join } from 'path';
import { compile } from 'handlebars';

export abstract class HTMLComponent {
    public template: string;
    public templateUrl: string;

    public data: { [key: string]: any };


    async render() {
        await this.process();
        const templateHTML = this.getTemplate();
        const template = compile(templateHTML);
        const html = template(this.data);

        return html;
    }

    private getTemplate() {
        if (this.template) {
            return this.template;
        } else if (this.templateUrl) {
            return readFileSync(join(__dirname, this.templateUrl), 'utf8');
        } else {
            throw new Error('no template');
        }
    }

    public async process() { }
}
