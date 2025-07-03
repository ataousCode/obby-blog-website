"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailClient = void 0;
var emailjs_1 = require("emailjs");
var EmailClient = /** @class */ (function () {
    function EmailClient() {
        this.client = new emailjs_1.SMTPClient({
            user: process.env.EMAIL_SERVER_USER || '',
            password: process.env.EMAIL_SERVER_PASSWORD || '',
            host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
            port: Number(process.env.EMAIL_SERVER_PORT) || 465,
            ssl: process.env.EMAIL_SECURE === 'true',
            tls: process.env.EMAIL_SECURE !== 'true'
        });
    }
    EmailClient.prototype.sendEmail = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var message, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        message = {
                            text: options.text || '',
                            from: options.from,
                            to: options.to,
                            subject: options.subject,
                            attachment: options.html ? [
                                {
                                    data: options.html,
                                    alternative: true
                                }
                            ] : undefined
                        };
                        console.log('Sending email with emailjs using Gmail SMTP...');
                        console.log("Using configured SMTP settings from environment variables");
                        console.log("From: ".concat(options.from, ", To: ").concat(options.to));
                        return [4 /*yield*/, this.client.sendAsync(message)];
                    case 1:
                        result = _a.sent();
                        console.log('Email sent successfully:', result);
                        return [2 /*return*/, { success: true, result: result }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Email sending failed:', error_1);
                        console.error('Error message:', error_1 instanceof Error ? error_1.message : String(error_1));
                        if (error_1 && typeof error_1 === 'object' && 'code' in error_1) {
                            console.error('Error code:', error_1.code);
                        }
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return EmailClient;
}());
exports.EmailClient = EmailClient;
