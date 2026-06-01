import { Request, Response } from 'express';
import { SsrService } from './ssr.service';
export declare class SsrController {
    private readonly ssrService;
    constructor(ssrService: SsrService);
    render(req: Request, res: Response): Promise<void>;
}
