import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from 'src/app/core/constants/token.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { TokenService } from 'src/app/core/services/token.service';
import { Globals } from 'src/app/global/global';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-community-pool',
  templateUrl: './community-pool.component.html',
  styleUrls: ['./community-pool.component.scss'],
})
export class CommunityPoolComponent implements OnInit, OnDestroy {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  textSearch = '';
  templates: Array<TableTemplate> = [
    { matColumnDef: 'name', headerCellDef: 'name' },
    { matColumnDef: 'symbol', headerCellDef: 'symbol' },
    { matColumnDef: 'amount', headerCellDef: 'amount' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  assetList: [];
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  dataSource: MatTableDataSource<any>;
  dataSourceMob: any[];
  filterSearchData = [];
  maxLengthSearch = MAX_LENGTH_SEARCH_TOKEN;
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  image_s3 = this.environmentService.configValue.image_s3;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  listCoin = this.environmentService.configValue.coins;
  listAssetLcd = [];
  searchSubject = new Subject();
  destroy$ = new Subject();

  constructor(
    public translate: TranslateService,
    public global: Globals,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
  ) {}

  ngOnDestroy(): void {
    // throw new Error('Method not implemented.');
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getListAsset();
    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.pageData.pageIndex === PAGE_EVENT.PAGE_INDEX) {
          this.getListAsset();
        } else {
          this.pageChange.selectPage(0);
        }
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  async getListAsset() {
    let auraAsset;
    if (this.textSearch) {
      this.filterSearchData = this.listAssetLcd;
      this.filterSearchData = this.filterSearchData.filter(
        (k) => k.name.toLowerCase().includes(this.textSearch) === true,
      );
      this.dataSource = new MatTableDataSource<any>(this.filterSearchData);
      this.dataSourceMob = this.dataSource.data.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );
      this.pageData.length = this.filterSearchData.length;
    } else {
      const res = await this.tokenService.getListAssetCommunityPool();
      this.listAssetLcd = _.get(res, 'data.pool');

      this.listAssetLcd.forEach((element) => {
        let test = this.listCoin.find((i) => i.denom === element.denom);
        if (test) {
          element.decimal = test.decimal;
          element.symbol = test.display;
          element.logo = test.logo;
          element.name = test.name;
        } else {
          element.decimal = 6;
          element.symbol = '';
          element.logo = '';
          element.name = 'Aura';
          auraAsset = element;
        }
      });
      this.listAssetLcd = this.listAssetLcd.filter((k) => k.symbol !== '');
      this.listAssetLcd = this.listAssetLcd.sort((a, b) => {
        return this.compare(a.amount, b.amount, false);
      });
      this.listAssetLcd.unshift(auraAsset);
      this.filterSearchData = this.listAssetLcd;
      this.dataSource = new MatTableDataSource<any>(this.listAssetLcd);
      this.dataSourceMob = this.dataSource.data.slice(
        this.pageData.pageIndex * this.pageData.pageSize,
        this.pageData.pageIndex * this.pageData.pageSize + this.pageData.pageSize,
      );
      this.pageData.length = this.listAssetLcd.length;
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }

  compare(a: number | string, b: number | string, isAsc: boolean) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  resetSearch() {
    this.textSearch = '';
    this.onKeyUp();
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    this.getListAsset();
  }
}
