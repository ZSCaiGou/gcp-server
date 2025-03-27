import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtExceptionFilter } from './common/filters/jwt-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    app.useGlobalPipes(new ValidationPipe({}));
    app.useGlobalFilters(new JwtExceptionFilter())
    // const microserviceRedis = app.connectMicroservice({
    //     transport: Transport.REDIS,
    //     options: {
    //         url: 'redis://localhost:6379',
    //     },
    // });
    // await app.startAllMicroservices()

    const options = new DocumentBuilder()
        .setTitle('GCP Server API')
        .setDescription('The GCP Server API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    


    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
