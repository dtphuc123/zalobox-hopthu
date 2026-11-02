import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bật validate toàn cục cho mọi DTO (class-validator):
  // - whitelist: loại bỏ field lạ không khai báo trong DTO
  // - forbidNonWhitelisted: báo lỗi rõ ràng nếu client gửi field thừa
  // - transform: tự chuyển kiểu (vd query string -> number/Date) theo DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
