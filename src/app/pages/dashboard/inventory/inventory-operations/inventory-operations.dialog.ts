import {Component, Inject, OnInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {LoadingService} from '@loading-service';
import {InventoryService} from '@app_services/inventory/inventory.service';
import {GetInventoryOperationsModel} from '@app_models/inventory/get-inventory-operations';
import {BehaviorSubject, Observable} from 'rxjs';

@Component({
  selector: 'app-inventory-operations',
  templateUrl: './inventory-operations.dialog.html'
})
export class InventoryOperationDialog implements OnInit {

  pageTitleSubject: BehaviorSubject<string> = new BehaviorSubject<string>("گردش انبار محصول");
  pageTitle: Observable<string> = this.pageTitleSubject.asObservable();

  operations: GetInventoryOperationsModel;

  constructor(
    public dialogRef: MatDialogRef<InventoryOperationDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {id: string},
    private inventoryService: InventoryService,
    private loading: LoadingService
  ) { }

  ngOnInit(): void {
    this.loading.loadingOn();

    this.inventoryService.getInventoryOperationLog(this.data.id).subscribe((res) => {
      this.pageTitleSubject.next(`گردش انبار محصول : ${res.productTitle}`);
      this.operations = res;
    });

    this.loading.loadingOff();

  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

}
