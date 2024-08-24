import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';

@Schema({})
export class Product {

    constructor(code: string, name: string, value: string) {
        this.code = code;
        this.name = name;
        this.value = value;
    }
    @Prop({unique:true})
    code: string
    @Prop()
    name: string
    @Prop()
    value: string

}

export type ProductDocument = HydratedDocument<Product>;


export const ProductSchema = SchemaFactory.createForClass(Product);