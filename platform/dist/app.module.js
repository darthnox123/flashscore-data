"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cache_manager_1 = require("@nestjs/cache-manager");
const ssr_module_1 = require("./ssr/ssr.module");
const health_module_1 = require("./api/health/health.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST ?? 'localhost',
                port: parseInt(process.env.DB_PORT ?? '5432'),
                username: process.env.DB_USER ?? 'postgres',
                password: process.env.DB_PASS ?? 'postgres',
                database: process.env.DB_NAME ?? 'platform',
                autoLoadEntities: true,
                synchronize: process.env.NODE_ENV !== 'production',
            }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: () => ({
                    stores: [
                        {
                            store: require('@keyv/redis'),
                            url: process.env.REDIS_URL ?? 'redis://localhost:6379',
                        },
                    ],
                }),
            }),
            ssr_module_1.SsrModule,
            health_module_1.HealthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map