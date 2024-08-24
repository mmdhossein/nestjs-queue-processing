import {Inject, Injectable} from '@nestjs/common';
import {FileServices} from "../file/file.services";
import {ProductServices} from "../products/product.services";
import {UserProduct, UserProductDocument} from "../../models/useres/userProducts";
import {Model} from "mongoose";
import {Product} from "../../models/products/products";
@Injectable()
export class UsersService {
    constructor(private fileServices: FileServices,
                private productService: ProductServices,
                @Inject(UserProduct.name) private userProductModel: Model<UserProduct>) {
    }

    async processUploadedFile(file: Express.Multer.File, userName: string, products?: Array<Product>) {
        if (!products) {
            products = await this.fileServices.readCsvFileAndGetProducts(file)
        }
        const productsId = await this.productService.addProductToDbIfNotExists(products)
        let userProduct = await this.findUserProductsByUserName(userName)
        if (userProduct) {
            for (const p of productsId) {
                if (!userProduct.products.includes(p)) {
                    userProduct.products.push(p)
                }
            }
            await userProduct.save()

        } else {
            userProduct = new UserProduct() as UserProductDocument
            userProduct.userName = userName
            userProduct.products = productsId
            await (new this.userProductModel(userProduct)).save()
        }
        return userProduct

    }

    async findUserProductsByUserName(userName: string): Promise<UserProductDocument> {
        return await this.userProductModel.findOne({userName: userName}).exec()
    }

    async getUserData(userName: string): Promise<Array<UserProduct>> {
        return this.userProductModel.aggregate([{
            $match: {userName: userName}
        },
            {
                $lookup: {
                    from: "products",
                    localField: "products",
                    foreignField: "_id",
                    as: "products"
                }
            },
        ])
    }

    async getUserDataByCode(userName: string, productCode: string): Promise<Array<UserProduct>> {
        const userProducts = await this.userProductModel.aggregate([{
            $match: {userName: userName}
        },
            {
                $lookup: {
                    from: "products",
                    localField: "products",
                    foreignField: "_id",
                    as: "products"
                }
            },
        ]);
        if (userProducts[0] && userProducts[0].products as Array<Product>) {
            userProducts[0].products = userProducts[0].products.filter(p => p.code == productCode)
        }
        return userProducts
    }

    async deleteUserData(userName: string) {
        return this.userProductModel.deleteOne({userName})

    }
}
