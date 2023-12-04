import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { LegacyPageEvent as PageEvent } from '@angular/material/legacy-paginator';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType, ContractVerifyType } from 'src/app/core/constants/contract.enum';
import { DATEFORMAT, PAGE_EVENT, TIMEOUT_ERROR } from '../../../core/constants/common.constant';
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
  typeCW4973 = TYPE_CW4973;
  templates: Array<TableTemplate> = [
    { matColumnDef: 'address', headerCellDef: 'COMMON.ADDRESS', isUrl: '/contracts', isShort: true, isNameTag: true },
    { matColumnDef: 'name', headerCellDef: 'LABEL.CONTRACT_NAME' },
    { matColumnDef: 'label', headerCellDef: 'LABEL.LABEL' },
    { matColumnDef: 'version', headerCellDef: 'PAGES.CONTRACT.contractVer' },
    { matColumnDef: 'type', headerCellDef: 'LABEL.TYPE' },
    { matColumnDef: 'token_tracker', headerCellDef: 'PAGES.CONTRACT.tokenTracker' },
    { matColumnDef: 'code_id', headerCellDef: 'LABEL.CODE_ID' },
    { matColumnDef: 'creator', headerCellDef: 'LABEL.CREATOR', isUrl: '/account', isShort: true, isNameTag: true },
  ];
  contractRegisterType = ContractRegisterType;
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: 1,
  };
  filterButtons = [];
  listContract = [];
  textSearch = '';
  isLoading = true;
  errTxt: string;

  dataSource = new MatTableDataSource<any>();
  searchSubject = new Subject();
  destroy$ = new Subject<void>();

  ContractRegisterType = ContractRegisterType;
  ContractVerifyType = ContractVerifyType;
  MAX_LENGTH_SEARCH_TOKEN = MAX_LENGTH_SEARCH_TOKEN;

  constructor(
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
      .pipe(debounceTime(500), takeUntil(this.destroy$))
      .subscribe(() => {
        this.pageEvent(0);
      });
  }

  onKeyUp() {
    this.searchSubject.next(this.textSearch);
  }

  getListContract() {
    this.textSearch = this.textSearch?.trim();
    let payload = {
      limit: this.pageData.pageSize,
      offset: (this.pageData.pageIndex - 1) * this.pageData.pageSize,
      keyword: this.textSearch,
      contractType: this.filterButtons?.length > 0 && this.filterButtons?.length < 4 ? this.filterButtons : null,
    };

    this.contractService.getListContract(payload).subscribe({
      next: (res) => {
        if (res?.smart_contract?.length) {
          res?.smart_contract.forEach((item) => {
            if (item?.code?.type === this.contractRegisterType.CW20 && item['cw20_contract']?.name) {
              item.url = '/tokens/token/' + item.address;
              item.token_tracker = item['cw20_contract']?.name;
            } else if (
              item?.code?.type === this.contractRegisterType.CW721 &&
              item?.name !== this.typeCW4973 &&
              item['cw721_contract']?.name
            ) {
              item.url = '/tokens/token-nft/' + item.address;
              item.token_tracker = item['cw721_contract']?.name;
            } else if (
              item['code'].type === this.contractRegisterType.CW721 &&
              item['name'] === this.typeCW4973 &&
              item['cw721_contract']?.name
            ) {
              item.url = '/tokens/token-abt/' + item.address;
              item.token_tracker = item['cw721_contract']?.name;
            }

            item.verified_at = this.datePipe.transform(
              item.code?.code_id_verifications[0]?.verified_at,
              DATEFORMAT.DATETIME_UTC,
            );
            item.type = item.code.type;
            if (item.type === ContractRegisterType.CW721 && item?.name === TYPE_CW4973) {
              item.type = ContractRegisterType.CW4973;
            }
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
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
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
