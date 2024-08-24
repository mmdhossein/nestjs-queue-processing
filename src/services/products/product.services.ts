import {Product, ProductDocument} from "../../models/products/products";
import {Inject, Injectable} from "@nestjs/common";
import {UserProduct} from "../../models/useres/userProducts";
import {Model} from "mongoose";

@Injectable()
export class ProductServices {
    constructor(@Inject(Product.name ) private productModel: Model<Product>,
               ) {
    }

    async addProductToDbIfNotExists(products: Product[]):Promise<any[]> {
        const productsId = []
        for (const p of products) {
            let product:ProductDocument
            product = await this.productModel.findOne({code:p.code}).exec()
            if(!product){
                product = new this.productModel(p)
                product = await product.save()
                console.log("product._id", product._id)
            }
            productsId.push(product._id)
        }
        return productsId
    }


}