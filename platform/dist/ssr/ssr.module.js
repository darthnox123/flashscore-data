"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SsrModule = void 0;
const common_1 = require("@nestjs/common");
const ssr_service_1 = require("./ssr.service");
const ssr_controller_1 = require("./ssr.controller");
let SsrModule = class SsrModule {
};
exports.SsrModule = SsrModule;
exports.SsrModule = SsrModule = __decorate([
    (0, common_1.Module)({
        providers: [ssr_service_1.SsrService],
        controllers: [ssr_controller_1.SsrController],
        exports: [ssr_service_1.SsrService],
    })
], SsrModule);
//# sourceMappingURL=ssr.module.js.map