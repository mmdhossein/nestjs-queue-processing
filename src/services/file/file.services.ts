import {Injectable} from "@nestjs/common";
import * as Papa from 'papaparse'
import {ParseResult} from "papaparse";
import {Product} from "../../models/products/products";
@Injectable()
export class FileServices {
   async  readCsvFileAndGetProducts(file:Express.Multer.File, ):Promise<Product[]> {
        const parsedCsv:ParseResult<string> = await Papa.parse(Buffer.from(file.buffer).toString(), {})
       const products = []
       for(const p of parsedCsv.data){
           if(p && p != '' && p[0] != 'Id'){
               products.push(new Product(p[1], p[2], p[3]))
           }
       }
       console.log("products", products)
       return products
    }
}