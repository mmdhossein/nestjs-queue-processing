import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {SetMetadata} from '@nestjs/common';
import {AppContextData} from "../../models/app/appContext";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector, private jwtService: JwtService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.get<string[]>(IS_PUBLIC_KEY, context.getHandler());
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = RolesGuard.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const appContext = new AppContextData()

            appContext.user = await this.jwtService.verifyAsync(token, {
                secret: '!21ASsig_nmenT',
            });//UserAuthBody
            request['AppContextData'] = appContext
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private static extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}

export const IS_PUBLIC_KEY = 'isPublic';//meta data key
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);