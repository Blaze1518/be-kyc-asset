import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import * as basicAuth from 'express-basic-auth';
import { writeFileSync } from 'fs';
import { join } from 'path';

export function setupSwagger(app: INestApplication): void {
  app.use(
    ['/api-docs', '/api-docs-json'],
    basicAuth.default({
      challenge: true,
      realm: 'My App API Docs',
      users: {
        [process.env.SWAGGER_USER || 'admin']:
          process.env.SWAGGER_PASS || 'default-pass',
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('NestJS Pro API')
    .setDescription('Tài liệu API chi tiết cho dự án')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Nhập mã token vào đây',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000/', 'Local environment')
    .addServer('https://yourdomain.com', 'Staging')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const outputPath = join(process.cwd(), 'swagger-spec.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  const themeName = 'theme-newspaper';
  const themeUrl = `https://cdn.jsdelivr.net/npm/swagger-ui-themes@3.0.0/themes/3.x/${themeName}.css`;

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'none',
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
      // defaultModelsExpandDepth: -1,
    },
    customSiteTitle: 'My Project API Documentation',
    customCssUrl: themeUrl,
    customfavIcon: 'https://nestjs.com/logo-small-gradient.0ed287ce.svg',
  });
}
