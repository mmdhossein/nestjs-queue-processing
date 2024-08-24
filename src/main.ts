import {NestFactory} from '@nestjs/core'
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import {MicroserviceOptions, Transport} from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RMQ_URL],  // Replace with your RabbitMQ server URL
            queue: 'products_queue_1',
            queueOptions: {
                durable: true,
            },
        },
    });
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RMQ_URL],  // Replace with your RabbitMQ server URL
            queue: 'products_queue_2',
            queueOptions: {
                durable: true,
            },
        },
    });
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RMQ_URL],  // Replace with your RabbitMQ server URL
            queue: 'products_queue_3',
            queueOptions: {
                durable: true,
            },
        },
    });
    await app.startAllMicroservices()
    const config = new DocumentBuilder()
        .setTitle('users products')
        .addBearerAuth({
            bearerFormat: "bearer", in: "header", type: 'http', name: 'authorization'
        }, 'authorization')
        .setDescription('')
        .setVersion('1.0')
        .addTag('')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
    await app.listen(8080);
}

bootstrap();
