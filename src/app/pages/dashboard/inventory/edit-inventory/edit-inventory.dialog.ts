import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {EditInventoryModel} from '@app_models/inventory/edit-inventory';
import {LoadingService} from '@loading-service';
import {InventoryService} from '@app_services/inventory/inventory.service';
import {checkFormGroupErrors} from '@app_services/_common/functions/functions';
import {BehaviorSubject, Observable} from 'rxjs';
import {ProductService} from '@app_services/shop/product/product.service';

@Component({
  selector: 'app-edit-inventory',
  templateUrl: './edit-inventory.dialog.html'
})
export class EditInventoryDialog implements OnInit {

  pageTitleSubject: BehaviorSubject<string> = new BehaviorSubject<string>("ویرایش انبار محصول :");
  pageTitle: Observable<string> = this.pageTitleSubject.asObservable();

  productId = '';
  editForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditInventoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {id: string},
    private productService: ProductService,
    private inventoryService: InventoryService,
    private loading: LoadingService
  ) { }

  ngOnInit(): void {
    this.editForm = new FormGroup({
      unitPrice: new FormControl(null, [Validators.required])
    });

    this.inventoryService.getInventoryDetails(this.data.id).subscribe((iRes) => {

      this.productId = iRes.productId;
      this.editForm.controls.unitPrice.setValue(iRes.unitPrice)

      this.productService.existsProductId(this.productId).subscribe((pRes) => {
        this.pageTitleSubject.next(`ویرایش انبار محصول : ${pRes.productTitle}`);
      });
    });

  }

  checkError(controlName: string, errorName: string): boolean {
    return checkFormGroupErrors(this.editForm, controlName, errorName)
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.loading.loadingOn()

    if (this.editForm.valid) {

      const editData = new EditInventoryModel(
        this.data.id,
        this.editForm.controls.productId.value,
        this.editForm.controls.unitPrice.value
      );

      this.inventoryService.editInventory(editData).subscribe((res) => {
        if (res.status === 200) {

          this.editForm.reset();
          this.onCloseClick();

        }
      });


    } else {
      this.editForm.markAllAsTouched();
    }

    this.loading.loadingOff()

  }

}
