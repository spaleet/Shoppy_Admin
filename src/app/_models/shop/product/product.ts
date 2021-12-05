export class ProductModel {
    constructor(
         public id: number,
         public title: string,
         public code: string,
         public unitPrice: string,
         public imagePath: string,
         public isInStock: boolean,
         public categoryTitle: string,
         public creationDate: string,
     ){}
 }