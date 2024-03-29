import {Component, AfterViewInit, OnInit, ViewChild} from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {tap} from 'rxjs/operators';
import {MatDialog} from '@angular/material/dialog';
import {environment} from '@app_env';
import {Title} from '@angular/platform-browser';
import {SliderDataSource} from '@app_models/shop/slider/slider-data-source';
import {SliderService} from '@app_services/shop/slider/slider.service';
import {CreateSliderDialog} from '../create-slider/create-slider.dialog';
import {EditSliderDialog} from '../edit-slider/edit-slider.dialog';

@Component({
  selector: 'app-slider-list',
  templateUrl: './slider-list.page.html'
})
export class SliderListPage implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  displayedColumns: string[] = ['id', 'thumbnailImage', 'heading', 'text', 'state', 'creationDate', 'commands'];
  dataSource: SliderDataSource;
  thumbnailBasePath = `${environment.sliderBaseImagePath}/thumbnail/`;

  constructor(
    private pageTitle: Title,
    public dialog: MatDialog,
    private sliderService: SliderService
  ) {
    this.pageTitle.setTitle('مدیریت دسته بندی محصولات');
  }

  ngOnInit(): void {
    this.dataSource = new SliderDataSource(this.sliderService);
    this.dataSource.loadSliders();

  }

  ngAfterViewInit(): void {

    this.paginator.page
      .pipe(
        tap(() => this.loadSlidersPage())
      )
      .subscribe();

  }

  openCreateDialog(): void {
    this.dialog.open(CreateSliderDialog, {
      width: '600px',
      height: '700px'
    }).afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }

  openEditDialog(id: string): void {
    this.dialog.open(EditSliderDialog, {
      width: '600px',
      height: '700px',
      data: {
        id: id
      }
    }).afterClosed().subscribe(result => {
      if (!result)
        return;

      this.ngOnInit();
    });
  }

  loadSlidersPage(): void {
    this.dataSource.loadSliders();
  }

  removeSlider(id: string): void {
    this.sliderService.removeSlider(id).subscribe((res) => {
      if (res.status === 200) {
        this.ngOnInit();
      }
    });
  }

  restoreSlider(id: string): void {
    this.sliderService.restoreSlider(id).subscribe((res) => {
      if (res.status === 200) {
        this.ngOnInit();
      }
    });
  }

}
