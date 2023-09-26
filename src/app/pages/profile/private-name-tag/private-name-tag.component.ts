import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NgxToastrService } from 'src/app/core/services/ngx-toastr.service';
import { isContract } from 'src/app/core/utils/common/validation';
import { Globals } from 'src/app/global/global';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';
import { PopupCommonComponent } from 'src/app/shared/components/popup-common/popup-common.component';
import { PopupNameTagComponent } from '../popup-name-tag/popup-name-tag.component';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { Router } from '@angular/router';

@Component({
  selector: 'app-private-name-tag',
  templateUrl: './private-name-tag.component.html',
  styleUrls: ['./private-name-tag.component.scss'],
})
export class PrivateNameTagComponent implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'favorite', headerCellDef: 'Fav', headerWidth: 8 },
    { matColumnDef: 'address', headerCellDef: 'Address', headerWidth: 12 },
    { matColumnDef: 'type', headerCellDef: 'Type', headerWidth: 6 },
    { matColumnDef: 'name_tag', headerCellDef: 'Private Name Tag', headerWidth: 12 },
    { matColumnDef: 'createdAt', headerCellDef: 'Added Time', headerWidth: 10 },
    { matColumnDef: 'updatedAt', headerCellDef: 'Updated Time', headerWidth: 10 },
    { matColumnDef: 'action', headerCellDef: '', headerWidth: 8 },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  countFav = 0;
  modalReference: any;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  textSearch = '';
  searchSubject = new Subject();
  destroy$ = new Subject();
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataSourceMobile = [];
  dataTable = [];
  nextKey = null;
  currentKey = null;
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;

  constructor(
    public commonService: CommonService,
    public nameTagService: NameTagService,
    private dialog: MatDialog,
    private toastr: NgxToastrService,
    private global: Globals,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const dataNameTag = localStorage.getItem('setAddressNameTag');
    if (dataNameTag && dataNameTag !== 'undefined') {
      const data = JSON.parse(dataNameTag);
      this.openPopup(data);
      localStorage.removeItem('setAddressNameTag');
    }

    this.commonService.listNameTag = this.global.listNameTag;
    this.getListPrivateName();
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageChange.selectPage(0);
      });
  }

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  getListPrivateName(nextKey = null) {
    this.textSearch = this.textSearch?.trim();
    const payload = {
      limit: 100,
      keyword: this.textSearch || '',
      nextKey: nextKey
    };

    this.nameTagService.getListPrivateNameTagNextKey(payload).subscribe((res) => {
      this.nextKey = null;
      if (res.data?.nameTags?.length >= 100) {
        this.nextKey = res.data[res.data?.nameTags?.length - 1]?.id;
      }
      this.countFav = res.data?.nameTags?.filter((k) => k.isFavorite === 1)?.length || 0;
      res.data?.nameTags.forEach((element) => {
        element['type'] = isContract(element.address) ? 'contract' : 'account';
      });
      this.dataSource.data = res.data?.nameTags;
      this.pageData.length = res?.data?.count || 0;

      if (this.dataSource?.data) {
        let dataMobTemp = this.dataSource.data?.slice(
          this.pageData.pageIndex * this.pageData.pageSize,
          this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
        );
        if(dataMobTemp.length !== 0) {
          this.dataSourceMobile = dataMobTemp
        } else {
          this.dataSourceMobile = this.dataSource.data?.slice(
            (this.pageData.pageIndex - 1) * this.pageData.pageSize,
            (this.pageData.pageIndex - 1) * this.pageData.pageSize + this.pageData.pageSize,
          );
        }
      }
    });
  }

  openPopup(data = null) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'grant-overlay-panel';
    dialogConfig.disableClose = true;
    if (data) {
      dialogConfig.data = data;
    }
    dialogConfig.data = { ...dialogConfig.data, ...{ currentLength: this.pageData?.length } };
    let dialogRef = this.dialog.open(PopupNameTagComponent, dialogConfig);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        setTimeout(() => {
          this.pageChange.selectPage(0);
        }, 4000);
      }
    });
  }

  openPopupDelete(data) {
    let dialogRef = this.dialog.open(PopupCommonComponent, {
      panelClass: 'sizeNormal',
      data: {
        title: 'Remove Private Name Tag',
        content:
          'Are you sure to remove private name tag for the address ' + data.address + ' (' + data.nameTag + ')?',
        class: 'text--gray-1',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result !== 'canceled') {
        this.deleteNameTag(data.id);
      }
    });
  }

  deleteNameTag(id) {
    this.nameTagService.deletePrivateNameTag(id).subscribe((res) => {
      if (res.code && res.code !== 200) {
        this.toastr.error(res.message || 'Error');
        return;
      }

      this.toastr.successWithTitle('Private name tag removed!', 'Success');
      setTimeout(() => {
        this.pageData.length--;
        this.pageEvent(this.pageData)
      }, 1000);
    });
  }

  updateFavorite(data) {
    const payload = {
      id: data.id,
      isFavorite: !data.isFavorite,
    };

    this.nameTagService.updatePrivateNameTag(payload).subscribe((res) => {
      setTimeout(() => {
        this.getListPrivateName();
      }, 1000);
    });
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  pageEvent(e: PageEvent): void {
    const { length, pageIndex, pageSize } = e;
    const next = length <= (pageIndex + 2) * pageSize;
    this.dataSourceMobile = this.dataSource.data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
    this.pageData = e;
    this.pageData.previousPageIndex = e.pageIndex;

    if (next && this.nextKey && this.currentKey !== this.nextKey) {
      this.getListPrivateName(this.nextKey);
      this.currentKey = this.nextKey;
    } else {
      this.getListPrivateName();
    }
  }

  navigateAddress(address): void {
    if (isContract(address)) {
      this.router.navigate(['/contracts', address]);
    } else {
      this.router.navigate(['/account', address]);
    }
  }
}