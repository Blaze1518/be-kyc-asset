import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/logger.config';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { setupSwagger } from './config/swagger/swagger.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  try {
    logger.log('Khởi tạo ứng dụng...');

    const app = await NestFactory.create(AppModule, {
      logger: logger,
      abortOnError: false,
    });

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    app.useGlobalPipes(new CustomValidationPipe());
    app.useGlobalInterceptors(new TransformInterceptor());

    setupSwagger(app);

    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Khởi tạo ứng dụng thất bại', err.stack);
    setTimeout(() => process.exit(1), 200);
  }
}
bootstrap();
