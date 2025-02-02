import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const origin = configService.get('front.origin');
  app.enableCors({
    origin: [origin],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  const port = configService.get('port');
  Logger.log(`.env PORT=${port}`);
  await app.listen(port);
}
bootstrap();
