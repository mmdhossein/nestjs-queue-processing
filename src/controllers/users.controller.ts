import {
    Body,
    Controller, Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {UsersService} from '../services/users/users.service';
import {FileInterceptor} from "@nestjs/platform-express";
import {ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse} from "@nestjs/swagger";
import {AppContext, AppContextData} from "../models/app/appContext";
import {Public, RolesGuard} from "../config/guard/auth.guard";
import {AuthService} from "../services/auth/auth.services";
import {UserAuthBody} from "../models/useres/userAuthBody";
import {QueueService} from "../services/queue/queue.service";
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {UploadFileRequest} from "../models/file/uploadFileRequest";
import {FileServices} from "../services/file/file.services";
import {UploadedProductsRequest} from "../models/products/uploadedProducts.Request";
import {QueueEnum} from "../models/queue/queueEnum";
import {UserProduct,} from "../models/useres/userProducts";
@Controller('user')
@UseGuards(RolesGuard)
export class UsersController {
    constructor(private readonly userService: UsersService,
                private readonly authService: AuthService,
                private readonly queueService: QueueService,
                private readonly fileServices: FileServices) {
    }

    @HttpCode(HttpStatus.OK)
    @Post('register')
    @ApiBody({type: UserAuthBody})
    @ApiOkResponse({schema:{properties:{access_token:{type:'string'}}}})
    @Public()
    register(@Body() signInDto: UserAuthBody) {
        return this.authService.register(signInDto.userName, signInDto.password);
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    @ApiBody({type: UserAuthBody})
    @ApiOkResponse({schema:{properties:{access_token:{type:'string'}}}})
    @Public()
    login(@Body() signInDto: UserAuthBody) {
        return this.authService.login(signInDto.userName, signInDto.password);
    }

    @Post('uploadFile')
    @ApiBearerAuth('authorization')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOkResponse({type:UserProduct})
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                // comment: { type: 'string' },
                // outletId: { type: 'integer' },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    uploadFile(@UploadedFile(new ParseFilePipeBuilder()
        .addFileTypeValidator({
            fileType: 'csv',
        })
        .addMaxSizeValidator({
            maxSize: 1000
        })
        .build({
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        }),) @Body() file: Express.Multer.File, @AppContext() appContext: AppContextData) {

        return this.userService.processUploadedFile(file, appContext.user.userName);
    }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('authorization')
    @Get('data')
    @ApiOkResponse({type:UserProduct})
    async getUserUserData(@AppContext() appContext: AppContextData) {
        const products = await this.userService.getUserData(appContext.user.userName);
        if (products[0]) return products[0]
        else return []
    }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('authorization')
    @Get('data/:code')
    @ApiOkResponse({type:UserProduct})
    async getUserUserDataByCode(@Param('code') code: string, @AppContext() appContext: AppContextData) {
        const products =  (await this.userService.getUserDataByCode(appContext.user.userName, code));
        if (products[0]) return products[0]
        else return []
    }

    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('authorization')
    @Delete('deleteData')
    deleteUserData(@AppContext() appContext: AppContextData) {
        return this.userService.deleteUserData(appContext.user.userName);
    }


    @Post('publishFileOnQueue')
    @ApiBearerAuth('authorization')
    @ApiConsumes('multipart/form-data')
    @ApiOkResponse({status:201})
    @UseInterceptors(FileInterceptor('file'))
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                queueName: {
                    type: 'array', items: {
                        enum: [QueueEnum.products_queue_1,
                            QueueEnum.products_queue_2,
                            QueueEnum.products_queue_3],examples:[QueueEnum.products_queue_1,
                            QueueEnum.products_queue_2,
                            QueueEnum.products_queue_3]
                    }
                },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    publishFile(@UploadedFile(new ParseFilePipeBuilder()
        .addFileTypeValidator({
            fileType: 'csv',
        })
        .addMaxSizeValidator({
            maxSize: 1000
        })
        .build({
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY
        }),) @Body() file: Express.Multer.File, @Body() queueName: string, @AppContext() appContext: AppContextData) {
        console.log('queueName-->', (queueName))
        return this.queueService.publishMessage(queueName['queueName'], {
            file: file,
            userName: appContext.user.userName
        });
    }

    @EventPattern('products_queue_1')
    @Public()
    async handleProductsMessageQ1(@Payload() data: UploadFileRequest, @Ctx() context: RmqContext) {
        console.log('Received message q1:', context.getPattern());
        await this.userService.processUploadedFile(data.file, data.userName)
    }

    @EventPattern('products_queue_2')
    @Public()
    async handleProductsMessageQ2(@Payload() data: UploadFileRequest, @Ctx() context: RmqContext) {
        console.log('Received message q2:', context.getPattern());
        const products = await this.fileServices.readCsvFileAndGetProducts(data.file)
        console.log("sending products on queue 3", products)
        await this.queueService.publishMessage('products_queue_3', {products, userName: data.userName})
    }

    @EventPattern('products_queue_3')
    @Public()
    async handleProductsMessageQ3(@Payload() data: UploadedProductsRequest, @Ctx() context: RmqContext) {
        console.log('Received message on q3:', data,);
        await this.userService.processUploadedFile(null, data.userName, data.products)
    }


}
