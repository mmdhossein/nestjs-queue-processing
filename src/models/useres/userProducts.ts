import mongoose, {HydratedDocument, ObjectId} from "mongoose";
import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";
import {Product} from "../products/products";
import {ApiProperty} from "@nestjs/swagger";

@Schema()
export class UserProduct {
    @Prop({type:String})
    @ApiProperty()
    userName:string
    @Prop({ type: [mongoose.Schema.Types.ObjectId] , ref: Product.name, })
    @ApiProperty()
    products:Array<ObjectId> = []
}

export type UserProductDocument = HydratedDocument<UserProduct>;


export const UserProductSchema = SchemaFactory.createForClass(UserProduct);