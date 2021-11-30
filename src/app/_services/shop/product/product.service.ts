import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app_models/common/IResponse';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { CreateProductModel, EditProductModel, FilterProductModel } from '@app_models/shop/product/_index';

@Injectable({
  providedIn: 'platform'
})
export class ProductService {
  constructor(
    private http: HttpClient
  ) { }

  filterProduct(filter: FilterProductModel): Observable<IResponse<FilterProductModel>> {

    let params;

    if (filter !== null) {
      params = new HttpParams()
        .set('Search', filter.search)
        .set('CategoryId', (filter.categoryId == '' ? 0 : parseInt(filter.categoryId)));
    }

    return this.http.get<IResponse<FilterProductModel>>(`${environment.shopBaseApiUrl}/product/filter-products`, { params });
  }
  
  getProductDetails(id: number): Observable<IResponse<EditProductModel>> {
    return this.http.get<IResponse<EditProductModel>>(`${environment.shopBaseApiUrl}/product/${id}`);
  }

  
  createProduct(createData: CreateProductModel):Observable<IResponse<any>> {
    const formData = new FormData();

    formData.append('categoryId', createData.categoryId.toString());
    formData.append('title', createData.title);
    formData.append('unitPrice', createData.unitPrice);

    if(createData.isInStock === true){
      formData.append('isInStock', 'true');
    } else{
      formData.append('isInStock', 'false');
    }

    formData.append('shortDescription', createData.shortDescription);
    formData.append('description', createData.description);
    formData.append('imageFile', createData.imageFile, createData.imageFile.name);
    formData.append('imageAlt', createData.imageAlt);
    formData.append('imageTitle', createData.imageTitle);
    formData.append('metaKeywords', createData.metaKeywords);
    formData.append('metaDescription', createData.metaDescription);
    
    return this.http.post<IResponse<any>>(`${environment.shopBaseApiUrl}/product/create-product`, formData);
  }

  editProduct(editData: EditProductModel):Observable<IResponse<any>> {
    
    const formData = new FormData();
    
    formData.append('id', editData.id.toString());
    formData.append('categoryId', editData.categoryId.toString());
    formData.append('title', editData.title);
    formData.append('unitPrice', editData.unitPrice);

    if(editData.isInStock){
      formData.append('isInStock', 'true');
    } else{
      formData.append('isInStock', 'false');
    }

    formData.append('shortDescription', editData.shortDescription);
    formData.append('description', editData.description);

    if(editData.imageFileUploaded){
      formData.append('imageFile', editData.imageFile, editData.imageFile.name);
    }

    formData.append('imageAlt', editData.imageAlt);
    formData.append('imageTitle', editData.imageTitle);
    formData.append('metaKeywords', editData.metaKeywords);
    formData.append('metaDescription', editData.metaDescription);
    
    return this.http.put<IResponse<any>>(`${environment.shopBaseApiUrl}/product/edit-product`, formData);
  }

  deleteProduct(productId: number):Observable<IResponse<any>> {
    return this.http.delete<IResponse<any>>(`${environment.shopBaseApiUrl}/product/delete-product/${productId}`);
  }

  updateProductIsInStock(productId: number):Observable<IResponse<any>> {
    return this.http.put<IResponse<any>>(`${environment.shopBaseApiUrl}/product/update-product-is-in-stock/${productId}`, null);
  }

  updateProductNotInStock(productId: number):Observable<IResponse<any>> {
    return this.http.delete<IResponse<any>>(`${environment.shopBaseApiUrl}/product/update-product-not-in-stock/${productId}`);
  }
}