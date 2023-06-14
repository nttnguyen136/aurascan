import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { DATEFORMAT, PAGE_EVENT } from '../../../core/constants/common.constant';
import { MAX_LENGTH_SEARCH_TOKEN } from '../../../core/constants/token.constant';
import { TableTemplate } from '../../../core/models/common.model';
import { ContractService } from '../../../core/services/contract.service';
import { shortenAddress } from '../../../core/utils/common/shorten';

@Component({
  selector: 'app-contracts-list',
  templateUrl: './contracts-list.component.html',
  styleUrls: ['./contracts-list.component.scss'],
})
export class ContractsListComponent implements OnInit, OnDestroy {
  templates: Array<TableTemplate> = [
    { matColumnDef: 'address', headerCellDef: 'Address', isUrl: '/contracts', isShort: true },
    { matColumnDef: 'name', headerCellDef: 'Contract Name' },
    { matColumnDef: 'code_id', headerCellDef: 'Code ID' },
    { matColumnDef: 'type', headerCellDef: 'Type Contract' },
    { matColumnDef: 'compiler_version', headerCellDef: 'Version' },
    { matColumnDef: 'contract_verification', headerCellDef: 'Verified' },
    { matColumnDef: 'creator', headerCellDef: 'Creator', isUrl: '/account', isShort: true },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: 1,
  };
  filterButtons = [];
  listContract = [];
  textSearch = '';

  dataSource = new MatTableDataSource<any>();
  searchSubject = new Subject();
  destroy$ = new Subject();

  ContractRegisterType = ContractRegisterType;
  ContractVerifyType = ContractVerifyType;
  MAX_LENGTH_SEARCH_TOKEN = MAX_LENGTH_SEARCH_TOKEN;

  constructor(
    public translate: TranslateService,
    private contractService: ContractService,
    private datePipe: DatePipe,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getListContract();

    this.searchSubject
      .asObservable()
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageEvent(0);
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getListContract() {
    let payload = {
      limit: this.pageData.pageSize,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
      keyword: this.textSearch,
      contractType: this.filterButtons?.length ? this.filterButtons : null,
    };

    this.contractService.getListContract(payload).subscribe((res) => {
      if (res?.smart_contract?.length) {
        res?.smart_contract.forEach((item) => {
          item.verified_at = this.datePipe.transform(
            item.code?.code_id_verifications[0]?.verified_at,
            DATEFORMAT.DATETIME_UTC,
          );
          item.type = item.code.type;
          item.compiler_version = item.code?.code_id_verifications[0]?.compiler_version;
          item.contract_verification = item.code.code_id_verifications[0]?.verification_status;
        });
        this.dataSource.data = res.smart_contract;
        this.pageData.length = res.smart_contract_aggregate?.aggregate?.count;
      } else {
        this.dataSource.data = [];
        this.listContract = [];
        this.pageData.length = 0;
      }
    });
  }

  pageEvent(pageIndex: number): void {
    // reset page 1 if pageIndex = 0
    if (pageIndex === 0) {
      this.pageData.pageIndex = 1;
    }

    this.getListContract();
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  resetFilterSearch() {
    this.textSearch = '';
    this.filterButtons = [];

    this.pageEvent(0);
  }

  filterButton(val: string) {
    console.log(val);

    const i = this.filterButtons.findIndex((i) => i === val);

    switch (val) {
      case 'All':
        this.filterButtons = [];
        break;
      case ContractRegisterType.CW20:
      case ContractRegisterType.CW721:
      case ContractRegisterType.CW4973:
      case '': //Others
      default:
        if (i >= 0) {
          this.filterButtons = this.filterButtons.filter((item) => item !== val);
        } else {
          this.filterButtons.push(val);
        }
    }
    this.pageEvent(0);
  }
}
