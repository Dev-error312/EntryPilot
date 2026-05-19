"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateRoutes = templateRoutes;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
async function templateRoutes(server) {
    // Download sample CSV template
    server.get('/sample/csv', async (request, reply) => {
        try {
            const filePath = path_1.default.join(__dirname, 'templates/sample-china-visa.csv');
            const content = await promises_1.default.readFile(filePath, 'utf-8');
            reply
                .header('Content-Type', 'text/csv')
                .header('Content-Disposition', 'attachment; filename="china-visa-template.csv"')
                .send(content);
        }
        catch (error) {
            reply.status(404).send({ error: 'Template not found' });
        }
    });
}
//# sourceMappingURL=template.routes.js.map