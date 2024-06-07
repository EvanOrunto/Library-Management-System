import { ValidationPipe } from '@nestjs/common';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.enableCors({ origin: /.+/ });

  app.use(json({ limit: '100mb' }));
  const appEnv = process.env.APP_ENV;

  app.setGlobalPrefix('lib/v1');

  if (appEnv == 'development' || appEnv == 'local') {
    const config = new DocumentBuilder()
      .setTitle('LMS')
      .setDescription('LMS Documentation')
      .setVersion('1.0')
      // .addApiKey(
      //   { type: 'apiKey', name: 'x-country-key', in: 'header' },
      //   'x-country-key',
      // )
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    if (appEnv == 'development') {
      SwaggerModule.setup('lms/dev/documentation', app, document);
    } else {
      SwaggerModule.setup('/dev/documentation', app, document);
    }
  }
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
