export class CustomerDiscountModel {
    constructor(
         public id: number,
         public productId: number,
         public product: string,
         public rate: number,
         public startDate: string,
         public endDate: string,
         public description: string,
         public creationDate: string,
         public isRemoved: boolean
     ){}
 }