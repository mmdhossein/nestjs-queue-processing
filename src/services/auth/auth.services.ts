import {BadRequestException, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'
import {Model} from "mongoose";
import {User, UserAuthBody} from "../../models/useres/userAuthBody";

@Injectable()
export class AuthService {

    constructor(private jwtService: JwtService,
                @Inject(User.name) private userModel: Model<User>) {
    }

    async login(username: string, password: string): Promise<any> {
        const user = await this.userModel.findOne({userName: username}).exec()
        if (!user || !await bcrypt.compare(password, user.password)) {
            throw new UnauthorizedException('username/password is incorrect');
        }
        const authBody = new UserAuthBody(username, bcrypt.hashSync(password, Number(process.env.HASH_SALT)))
        return {
            access_token: await this.jwtService.signAsync(JSON.stringify(authBody),{secret:process.env.JWT_SECRET}),
        };
    }

    async register(username: string, password: string): Promise<any> {
        const user = await this.userModel.findOne({userName: username}).exec()
        if (user) {
            throw new BadRequestException('username already exists');
        }
        const authBody = new UserAuthBody(username, bcrypt.hashSync(password, Number(process.env.HASH_SALT)))
        await (new this.userModel(authBody)).save()

        return {
            access_token: await this.jwtService.signAsync(JSON.stringify(authBody), {secret:process.env.JWT_SECRET}),
        };
    }
}