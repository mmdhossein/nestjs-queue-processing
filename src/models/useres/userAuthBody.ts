import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {ApiProperty} from "@nestjs/swagger";



export class UserAuthBody {
    @Prop({type:String})
    @ApiProperty()
    userName:string
    @Prop({type:String})
    @ApiProperty()
    password:string

    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
}

@Schema()
export class User extends UserAuthBody{}

export type UserDocument = HydratedDocument<User>;


export const UserSchema = SchemaFactory.createForClass(User);