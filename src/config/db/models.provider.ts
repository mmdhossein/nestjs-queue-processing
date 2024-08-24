import { Connection } from 'mongoose';
import {Product, ProductSchema} from "../../models/products/products";
import {User, UserSchema} from "../../models/useres/userAuthBody";
import {UserProduct, UserProductSchema} from "../../models/useres/userProducts";

export const modelProviders = [
    {
        provide: Product.name,
        useFactory: (connection: Connection) => connection.model(Product.name, ProductSchema),
        inject: ['DATABASE_CONNECTION'],
    },
    {
        provide: User.name,
        useFactory: (connection: Connection) => connection.model(User.name, UserSchema),
        inject: ['DATABASE_CONNECTION'],
    },
    {
        provide: UserProduct.name,
        useFactory: (connection: Connection) => connection.model(UserProduct.name, UserProductSchema),
        inject: ['DATABASE_CONNECTION'],
    },


];