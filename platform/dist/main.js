"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const ssr_service_1 = require("./ssr/ssr.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true, whitelist: true }));
    const ssrService = app.get(ssr_service_1.SsrService);
    await ssrService.initialize(app.getHttpAdapter().getInstance());
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Application running on http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map