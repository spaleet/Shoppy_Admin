/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, Inject, OnInit} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {CkeditorService} from '@app_services/_common/ckeditor/ckeditor.service';
import {checkFormGroupErrors} from '@app_services/_common/functions/functions';
import {LoadingService} from '@loading-service';
import {environment} from '@app_env';
import {ToastrService} from 'ngx-toastr';
import {ArticleCategoryService} from '@app_services/blog/article-category/article-category.service';
import {EditArticleCategoryModel} from '@app_models/blog/article-category/edit-article-category';

@Component({
  selector: 'app-edit-article-category',
  templateUrl: './edit-article-category.dialog.html'
})
export class EditArticleCategoryDialog implements OnInit {


  editForm: FormGroup;
  fileUploaded = false;
  imageFileToUpload: File;
  imagePath: string;
  ckeditorTextValue = null;

  constructor(
    public dialogRef: MatDialogRef<EditArticleCategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {id: string},
    private articleCategoryService: ArticleCategoryService,
    private ckeditorService: CkeditorService,
    private loading: LoadingService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.ckeditorService.initCkeditor();

    this.editForm = new FormGroup({
      title: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      orderShow: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      imageAlt: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      imageTitle: new FormControl(null, [Validators.required, Validators.maxLength(200)]),
      metaKeywords: new FormControl(null, [Validators.required, Validators.maxLength(80)]),
      metaDescription: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
      canonicalAddress: new FormControl(null, [Validators.maxLength(500)])
    });

    this.articleCategoryService.getArticleCategoryDetails(this.data.id).subscribe((res) => {

      this.editForm.controls.title.setValue(res.title)
      this.editForm.controls.orderShow.setValue(res.orderShow)
      this.ckeditorTextValue = res.description;
      this.ckeditorService.setValue(res.description);
      this.imagePath = `${environment.articleCategoryBaseImagePath}/original/${res.imagePath}`;
      this.editForm.controls.imageAlt.setValue(res.imageAlt);
      this.editForm.controls.imageTitle.setValue(res.imageTitle);
      this.editForm.controls.metaKeywords.setValue(res.metaKeywords);
      this.editForm.controls.metaDescription.setValue(res.metaDescription);
      this.editForm.controls.canonicalAddress.setValue(res.canonicalAddress);
    });
  }

  checkError(controlName: string, errorName: string): boolean {
    return checkFormGroupErrors(this.editForm, controlName, errorName)
  }

  getImageFileToUpload(event: any): void {
    this.loading.loadingOn();

    this.imageFileToUpload = event.target.files[0];
    this.fileUploaded = true;

    this.loading.loadingOff();
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.loading.loadingOn();

    this.ckeditorTextValue = this.ckeditorService.getValue();

    if (this.editForm.valid) {

      if (!this.fileUploaded) {
        this.imageFileToUpload = null;
      }

      const editData = new EditArticleCategoryModel(
        this.data.id,
        this.editForm.controls.title.value,
        this.ckeditorService.getValue(),
        this.editForm.controls.orderShow.value,
        this.fileUploaded,
        this.imageFileToUpload,
        this.editForm.controls.imageAlt.value,
        this.editForm.controls.imageTitle.value,
        this.editForm.controls.metaKeywords.value,
        this.editForm.controls.metaDescription.value,
        this.editForm.controls.canonicalAddress.value
      );

      this.articleCategoryService.editArticleCategory(editData).subscribe((res) => {
        if (res.status === 200) {

          this.editForm.reset();
          this.onCloseClick();

        }
      });

    } else {
      this.editForm.markAllAsTouched();
    }
    this.loading.loadingOff();

  }

}
