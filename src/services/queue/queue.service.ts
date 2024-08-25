import {ClientProxy, Ctx, EventPattern, MessagePattern, Payload, RmqContext,} from "@nestjs/microservices";
import {Inject, Injectable} from "@nestjs/common";

@Injectable()
export class QueueService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    ) {}
    @MessagePattern('products_queue_1')
    getNotifications(@Payload() data: number[], @Ctx() context: RmqContext) {
        console.log(`Pattern: ${context.getPattern()}`);
    }
    public async publishMessage(pattern: string, data: any): Promise<void> {
        const result = await this.client.emit(pattern, data);
        console.log(result)
    }
}
