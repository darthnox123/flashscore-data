export declare class SsrService {
    private readonly logger;
    private vite;
    private renderFn;
    private templateHtml;
    private isProd;
    initialize(expressApp: import('express').Application): Promise<void>;
    private initProduction;
    private initDevelopment;
    render(url: string): Promise<string>;
    private renderProduction;
    private renderDevelopment;
}
