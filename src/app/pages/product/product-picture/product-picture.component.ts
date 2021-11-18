import { Component, AfterViewInit, ElementRef, OnInit, ViewChild } from '@angular/core';
import { fromEvent } from 'rxjs';
import { Title } from "@angular/platform-browser";
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CreateProductComponent } from '../create-product/create-product.component';
import { environment } from '@environments/environment';
import { EditProductComponent } from '../edit-product/edit-product.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductPictureModel } from '@app_models/product-picture/product-picture';
import { ProductPictureService } from '@app_services/product-picture/product-category.service';
import { FilterProductPictureModel } from '@app_models/product-picture/filter-product-picture';
import { CreateProductPictureModel } from '@app_models/product-picture/create-product-picture';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-product-picture',
  templateUrl: './product-picture.component.html',
  styleUrls: ['./product-picture.component.css']
})
export class ProductPictureComponent implements OnInit {

  //#region properties

  productPictures: ProductPictureModel[] = [];
  productPictureBasePath: string = `${environment.productPicutreBaseImagePath}/thumbnail/`;
  productId: number = 0;
  productTitle: string = '';
  pageLoading: boolean = false;
  imageFileToUpload: any;
  fileUploaded: boolean = false;
  createForm: FormGroup;

  //#endregion

  //#region Ctor

  constructor(
    private pageTitle: Title,
    public dialog: MatDialog,
    private productPictureService: ProductPictureService,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute
  ) {
    this.pageTitle.setTitle('گالری تصاویر محصول');

  }

  //#endregion

  //#region ngOnInit

  ngOnInit(): void {

    this.createForm = new FormGroup({
      imageAlt: new FormControl(null, [Validators.required]),
      imageTitle: new FormControl(null, [Validators.required])
    });

    this.activatedRoute.params.subscribe(params => {
      const productId = params.productId;
      const productTitle = params.productTitle;

      if (productId === undefined) {
        this.router.navigate(['/']);
      }
      this.productId = productId;
      this.pageTitle = productTitle;


      this.productPictureService.filterProductPictures(new FilterProductPictureModel(this.productId.toString(), []))
        .subscribe((res) => {
          if (res.status === 'success') {

            this.productPictures = res.data.productPictures;
            this.pageLoading = true;

          }
        },
          (error) => {
            if (error instanceof HttpErrorResponse) {
              this.toastr.toastrConfig.tapToDismiss = false;
              this.toastr.toastrConfig.autoDismiss = true;
              this.toastr.toastrConfig.timeOut = 2500;

              this.toastr.error(error.error.message, 'خطا');
            }
          }
        );

    });


  }

  //#endregion

  //#region submitCreateForm

  submitCreateForm() {
    if (this.imageFileToUpload === undefined || this.imageFileToUpload === null) {
      this.fileUploaded = false;
    } else {
      this.fileUploaded = true;
    }

    const createData = new CreateProductPictureModel(
      this.productId,
      this.imageFileToUpload,
      this.createForm.controls.imageAlt.value,
      this.createForm.controls.imageTitle.value
    );

    this.productPictureService.createProductPicture(createData).subscribe((res) => {
      if (res.status === 'success') {

        this.createForm.reset();

        this.ngOnInit();
        
        this.toastr.toastrConfig.tapToDismiss = false;
        this.toastr.toastrConfig.autoDismiss = true;
        this.toastr.toastrConfig.timeOut = 1500;

        this.toastr.success(res.message, 'موفقیت');



      }
    },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toastr.toastrConfig.tapToDismiss = false;
          this.toastr.toastrConfig.autoDismiss = true;
          this.toastr.toastrConfig.timeOut = 2500;

          this.toastr.error(error.error.message, 'خطا');
        }
      }
    );


  }

  //#endregion

  getImageFileToUpload(event: any) {
    this.imageFileToUpload = event.target.files[0];
    this.fileUploaded = true;
  }


  //#region deleteProduct

  removeProductPicture(id: number) {
    this.productPictureService.removeProductPicture(id).subscribe((res) => {
      if (res.status === 'success') {


        this.ngOnInit();

        this.toastr.toastrConfig.tapToDismiss = false;
        this.toastr.toastrConfig.autoDismiss = true;
        this.toastr.toastrConfig.timeOut = 1500;

        this.toastr.success('محصول مورد نظر با موفقیت حذف شد', 'موفقیت');
      }
    },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toastr.toastrConfig.tapToDismiss = false;
          this.toastr.toastrConfig.autoDismiss = true;
          this.toastr.toastrConfig.timeOut = 2500;

          this.toastr.error(error.error.message, 'خطا');
        }
      }
    );
  }

  //#endregion

}
