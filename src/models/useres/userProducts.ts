import mongoose, {HydratedDocument, ObjectId} from "mongoose";
import {Prop, SchemaFactory, Schema} from "@nestjs/mongoose";
import {Product} from "../products/products";

@Schema()
export class UserProduct {
    @Prop({type:String})
    userName:string
    @Prop({ type: [mongoose.Schema.Types.ObjectId] , ref: Product.name, })
    products:Array<ObjectId> = []
}

export type UserProductDocument = HydratedDocument<UserProduct>;


export const UserProductSchema = SchemaFactory.createForClass(UserProduct);