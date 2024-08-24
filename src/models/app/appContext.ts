import {UserAuthBody} from "../useres/userAuthBody";
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class AppContextData {
    user:UserAuthBody
}



export const AppContext = createParamDecorator(
    (data: string, ctx: ExecutionContext):AppContextData => {
        const request = ctx.switchToHttp().getRequest();
        return  request['AppContextData'];
    },
);