import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import path from 'path';
import fs from 'fs/promises';

export async function templateRoutes(server: FastifyInstance) {
  // Download sample CSV template
  server.get('/sample/csv', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const filePath = path.join(__dirname, 'templates/sample-china-visa.csv');
      const content = await fs.readFile(filePath, 'utf-8');
      
      reply
        .header('Content-Type', 'text/csv')
        .header('Content-Disposition', 'attachment; filename="china-visa-template.csv"')
        .send(content);
    } catch (error) {
      reply.status(404).send({ error: 'Template not found' });
    }
  });
}
