"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SsrService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsrService = void 0;
const common_1 = require("@nestjs/common");
const fs_1 = require("fs");
const path_1 = require("path");
let SsrService = SsrService_1 = class SsrService {
    constructor() {
        this.logger = new common_1.Logger(SsrService_1.name);
        this.vite = null;
        this.renderFn = null;
        this.templateHtml = '';
        this.isProd = process.env.NODE_ENV === 'production';
    }
    async initialize(expressApp) {
        if (this.isProd) {
            await this.initProduction();
        }
        else {
            await this.initDevelopment(expressApp);
        }
    }
    async initProduction() {
        const distClient = (0, path_1.resolve)(process.cwd(), 'dist/client');
        const indexPath = (0, path_1.resolve)(distClient, 'index.html');
        if (!(0, fs_1.existsSync)(indexPath)) {
            this.logger.warn('Production build not found. Run `npm run build` first.');
            return;
        }
        this.templateHtml = (0, fs_1.readFileSync)(indexPath, 'utf-8');
        const { render } = await Promise.resolve(`${(0, path_1.resolve)(process.cwd(), 'dist/server/entry-server.mjs')}`).then(s => require(s));
        this.renderFn = render;
        this.logger.log('SSR initialized in production mode');
    }
    async initDevelopment(expressApp) {
        const { createServer } = await Promise.resolve().then(() => require('vite'));
        this.vite = await createServer({
            server: { middlewareMode: true },
            appType: 'custom',
        });
        expressApp.use(this.vite.middlewares);
        this.logger.log('SSR initialized in development mode with Vite middleware');
    }
    async render(url) {
        try {
            if (this.isProd) {
                return this.renderProduction(url);
            }
            return this.renderDevelopment(url);
        }
        catch (e) {
            this.vite?.ssrFixStacktrace(e);
            throw e;
        }
    }
    async renderProduction(url) {
        if (!this.renderFn || !this.templateHtml) {
            return '<html><body><div id="app">Build not available</div></body></html>';
        }
        const { html } = await this.renderFn(url);
        return this.templateHtml.replace('<!--app-html-->', html);
    }
    async renderDevelopment(url) {
        const indexPath = (0, path_1.resolve)(process.cwd(), 'index.html');
        let template = (0, fs_1.readFileSync)(indexPath, 'utf-8');
        template = await this.vite.transformIndexHtml(url, template);
        const { render } = await this.vite.ssrLoadModule('/client/entry-server.ts');
        const { html } = await render(url);
        return template.replace('<!--app-html-->', html);
    }
};
exports.SsrService = SsrService;
exports.SsrService = SsrService = SsrService_1 = __decorate([
    (0, common_1.Injectable)()
], SsrService);
//# sourceMappingURL=ssr.service.js.map