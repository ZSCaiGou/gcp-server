import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // const microserviceRedis = app.connectMicroservice({
    //     transport: Transport.REDIS,
    //     options: {
    //         url: 'redis://localhost:6379',
    //     },
    // });
    // await app.startAllMicroservices()
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
