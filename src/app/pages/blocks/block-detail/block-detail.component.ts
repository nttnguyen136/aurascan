import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TransactionService } from 'src/app/core/services/transaction.service';
import { PAGE_EVENT, TIMEOUT_ERROR } from '../../../../app/core/constants/common.constant';
import { TableTemplate } from '../../../../app/core/models/common.model';
import { BlockService } from '../../../../app/core/services/block.service';
import { CommonService } from '../../../../app/core/services/common.service';
import { convertDataBlock, convertDataTransactionSimple } from '../../../../app/global/global';

@Component({
  selector: 'app-block-detail',
  templateUrl: './block-detail.component.html',
  styleUrls: ['./block-detail.component.scss'],
})
export class BlockDetailComponent implements OnInit {
  blockHeight: string | number;
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 20,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };

  blockDetail = undefined;
  TAB = [
    {
      id: 0,
      value: 'Summary',
    },
    {
      id: 1,
      value: 'JSON',
    },
  ];

  templates: Array<TableTemplate> = [
    { matColumnDef: 'tx_hash', headerCellDef: 'Tx Hash' },
    { matColumnDef: 'type', headerCellDef: 'Message' },
    { matColumnDef: 'status', headerCellDef: 'Result' },
    { matColumnDef: 'fee', headerCellDef: 'Fee' },
    { matColumnDef: 'height', headerCellDef: 'Height' },
    { matColumnDef: 'timestamp', headerCellDef: 'Time' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  dataTxs: any[];
  loading = true;
  loadingTxs = true;
  isRawData = false;
  errTxt: string;
  errTxtTxs: string;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe();

  denom = this.environmentService.chainInfo.currencies[0].coinDenom;
  coinInfo = this.environmentService.chainInfo.currencies[0];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blockService: BlockService,
    public commonService: CommonService,
    private layout: BreakpointObserver,
    private environmentService: EnvironmentService,
    private transactionService: TransactionService,
  ) {}

  ngOnInit(): void {
    this.blockHeight = this.route.snapshot.paramMap.get('height');
    if (this.blockHeight === 'null') {
      this.router.navigate(['/']);
    }
    this.getDetail();
  }

  getDetail(): void {
    if (this.blockHeight) {
      this.getDetailByHeight();
    }
  }

  getDetailByHeight() {
    let payload = {
      limit: 1,
      height: this.blockHeight,
    };
    this.blockService.getDataBlockDetail(payload).subscribe({
      next: async (res) => {
        if (res?.block?.length > 0) {
          const block = convertDataBlock(res)[0];
          block['round'] = _.get(res.block[0], 'data.block.last_commit.round');
          block['chainid'] = _.get(res.block[0], 'data.block.header.chain_id');
          block['json_data'] = _.get(res.block[0], 'data.block');
          block['gas_used'] = block['gas_wanted'] = 0;
          block['events'] = _.get(res.block[0], 'data.block_result.begin_block_events');
          const blockEnd = _.get(res.block[0], 'data.block_result.end_block_events');
          if (blockEnd) {
            block['events'] = block['events'].concat(blockEnd);
          }
          this.blockDetail = block;
          //get list tx detail
          let txs = [];
          const payload = {
            limit: 100,
            height: this.blockHeight,
          };
          this.transactionService.getListTx(payload).subscribe({
            next: (res) => {
              if (res?.transaction) {
                txs = res?.transaction;
              }
            },
            error: (e) => {
              if (e.name === TIMEOUT_ERROR) {
                this.errTxtTxs = e.message;
              } else {
                this.errTxtTxs = e.status + ' ' + e.statusText;
              }
              this.loadingTxs = false;
            },
          });

          await Promise.all(txs);
          setTimeout(() => {
            if (txs?.length > 0) {
              let dataTempTx = {};
              dataTempTx['transaction'] = txs;
              if (txs.length > 0) {
                txs = convertDataTransactionSimple(dataTempTx, this.coinInfo);
                dataTempTx['transaction'].forEach((k) => {
                  this.blockDetail['gas_used'] += +k?.gas_used;
                  this.blockDetail['gas_wanted'] += +k?.gas_wanted;
                });
                this.dataSource.data = txs;
              }
            }
            this.loadingTxs = false;
          }, 1000);
        } else {
          setTimeout(() => {
            this.getDetailByHeight();
          }, 10000);
        }
      },
      error: (e) => {
        if (e.name === TIMEOUT_ERROR) {
          this.errTxt = e.message;
        } else {
          this.errTxt = e.status + ' ' + e.statusText;
        }
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  checkAmountValue(amount: number, txHash: string) {
    if (amount === 0) {
      return '-';
    } else {
      return `<a class="text--primary" [routerLink]="['/transaction', ` + txHash + `]">More</a>`;
    }
  }

  changeType(type: boolean): void {
    this.isRawData = type;
  }

  handlePageEvent(e: any) {
    this.pageData.pageIndex = e.pageIndex;
    if (this.pageData) {
      const { pageIndex, pageSize } = this.pageData;
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      this.dataTxs = this.dataSource.data.slice(start, end);
    }
  }

  paginatorEmit(event): void {
    this.dataSource.paginator = event;
  }
}
