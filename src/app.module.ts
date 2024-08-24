import {Module} from '@nestjs/common';
import {UsersController} from './controllers/users.controller';
import {UsersService} from './services/users/users.service';
import {FileServices} from "./services/file/file.services";
import {ProductServices} from "./services/products/product.services";
import {databaseProviders} from "./config/db/db.provider";
import {modelProviders} from "./config/db/models.provider";
import {JwtService} from "@nestjs/jwt";
import {AuthService} from "./services/auth/auth.services";
import {ConfigModule} from "@nestjs/config";
import { ClientsModule, Transport } from '@nestjs/microservices'
import {QueueService} from "./services/queue/queue.service";
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.development.env',
        }).module,
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RMQ_URL],
                    queue: 'products_queue_1',
                    queueOptions: {
                        durable: true
                    },
                },
            },
        ]),
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RMQ_URL],
                    queue: 'products_queue_2',
                    queueOptions: {
                        durable: true
                    },
                },
            },
        ]),
        ClientsModule.register([
            {
                name: 'RABBITMQ_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: [process.env.RMQ_URL],
                    queue: 'products_queue_3',
                    queueOptions: {
                        durable: true
                    },
                },
            },
        ])
    ],
    controllers: [UsersController],
    providers: [JwtService,AuthService,QueueService,
        UsersService, FileServices,ProductServices,...databaseProviders,...modelProviders],
    exports:[...databaseProviders]
})
export class AppModule {
}
