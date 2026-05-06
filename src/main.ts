import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/logger.config';
import { AllExceptionsFilter } from './common/exceptions/all-exceptions.filter';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { setupSwagger } from './config/swagger/swagger.config';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);
  try {
    logger.log('Khởi tạo ứng dụng...');

    const app = await NestFactory.create(AppModule, {
      logger: logger,
      abortOnError: false,
    });

    const configService = app.get(ConfigService);
    const globalPrefix = configService.get<string>('GLOBAL_PREFIX') || '';
    app.setGlobalPrefix(globalPrefix);

    const httpAdapterHost = app.get(HttpAdapterHost);
    app.use(cookieParser());
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));
    app.useGlobalPipes(new CustomValidationPipe());
    app.useGlobalInterceptors(new TransformInterceptor());

    app.enableCors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    });

    setupSwagger(app);

    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Khởi tạo ứng dụng thất bại', err.stack);
    setTimeout(() => process.exit(1), 200);
  }
}
bootstrap();
