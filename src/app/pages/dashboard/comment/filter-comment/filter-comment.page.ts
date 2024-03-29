/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, AfterViewInit, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatDialog} from '@angular/material/dialog';
import {Title} from '@angular/platform-browser';
import {MatTableDataSource} from '@angular/material/table';
import {CommentDataServer} from '@app_models/comment/comment-data-server';
import {CommentModel, FilterCommentModel} from '@app_models/comment/_index';
import {CommentService} from '@app_services/comment/comment.service';
import {FilterCommentState, FilterCommentType} from '@app_models/comment/filter-comment';
import {ConfirmDialog} from '@app_components/confirm-dialog/confirm.dialog';
import {IConfirmDialogConfig} from '@app_models/_common/IConfirmDialogConfig';

@Component({
  selector: 'app-filter-comment',
  templateUrl: './filter-comment.page.html'
})
export class FilterCommentPage implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  statesForView: {
    text: string,
    value: string
  }[] = [
      {text: "همه", value: FilterCommentState.All},
      {text: "در حال بررسی", value: FilterCommentState.UnderProgress},
      {text: "رد شده", value: FilterCommentState.Canceled},
      {text: "تایید شده", value: FilterCommentState.Confirmed}
    ];
  typesForView: {
    text: string,
    value: string
  }[] = [
      {text: "همه", value: FilterCommentType.All},
      {text: "محصول", value: FilterCommentType.Product},
      {text: "مقاله", value: FilterCommentType.Article}
    ];
  displayedColumns: string[] = ['name', 'email', 'text', 'type', 'state', 'ownerName', 'creationDate', 'commands'];
  dataServer: CommentDataServer;
  filterType: FilterCommentType = FilterCommentType.All;
  filterState: FilterCommentState = FilterCommentState.All;
  dataSource: MatTableDataSource<CommentModel> = new MatTableDataSource<CommentModel>([]);
  isDataSourceLoaded = false;
  filterComments: FilterCommentModel = new FilterCommentModel(this.filterType, this.filterState, 1, 15);

  constructor(
    private pageTitle: Title,
    public dialog: MatDialog,
    private commentService: CommentService
  ) {
    this.pageTitle.setTitle('مدیریت نظرات');
  }

  ngOnInit(): void {
    this.dataServer = new CommentDataServer(this.commentService);
    this.dataServer.load(this.filterComments);
    this.dataSource = new MatTableDataSource<CommentModel>(this.dataServer.data);
    this.dataSource.paginator = this.paginator;

    if (this.dataSource.data.length === 0) {
      this.isDataSourceLoaded = false;
    }
  }

  ngAfterViewInit(): void {

    setInterval(() => {
      if (this.isDataSourceLoaded === false) {
        this.dataSource = new MatTableDataSource<CommentModel>(this.dataServer.data);
        this.paginator.pageIndex = (this.dataServer.pageId - 1);
        this.paginator.length = this.dataServer.resultsLength;
        this.paginator.pageSize = this.filterComments.takePage;

        if (this.dataSource.data.length !== 0) {
          this.isDataSourceLoaded = true;
        } else {
          this.isDataSourceLoaded = false;
        }
      }

    }, 1000);


  }

  onPaginateChange(event: PageEvent): void {
    let page = event.pageIndex;
    const size = event.pageSize;

    page = page + 1;

    if (this.filterComments.takePage !== size) {
      page = 1;
    }

    this.filterComments = new FilterCommentModel(
      this.filterType,
      this.filterState,
      page,
      size
    );
    this.ngOnInit();
    this.paginator.pageSize = size;
  }

  setFilterType(event: any): void {
    this.filterType = event.value;
    this.loadCommentsPage();
  }

  setFilterState(event: any): void {
    this.filterState = event.value;
    this.loadCommentsPage();
  }

  loadCommentsPage(): void {
    this.filterComments = new FilterCommentModel(
      this.filterType,
      this.filterState,
      (this.paginator.pageIndex + 1),
      this.paginator.pageSize
    );

    this.ngOnInit();
    this.paginator.length = this.dataServer.resultsLength;
    this.paginator.pageSize = this.filterComments.takePage;
  }

  confirmComment(id: string): void {
    this.commentService.confirmComment(id).subscribe((res) => {
      if (res.status === 200) {
        this.ngOnInit();
      }
    });
  }

  cancelComment(id: string): void {

    this.dialog.open(ConfirmDialog, {
      width: '300px',
      height: '300px',
      data: <IConfirmDialogConfig>{
        message: "آیا از رد این کامنت اطمینان دارید ؟",
        title: "رد کامنت",
        cancelBtnMessage: "بستن",
        submitBtnMessage: "رد"
      }
    }).afterClosed().subscribe(result => {
      if (!result)
        return;

      this.commentService.cancelComment(id).subscribe((res) => {
        if (res.status === 200) {
          this.ngOnInit();
        }
      });
    });
  }
}
