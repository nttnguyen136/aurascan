import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PAGE_EVENT } from 'src/app/core/constants/common.constant';
import { PROPOSAL_STATUS } from 'src/app/core/constants/proposal.constant';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { TableTemplate } from 'src/app/core/models/common.model';
import { CommonService } from 'src/app/core/services/common.service';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { TokenService } from 'src/app/core/services/token.service';
import { shortenAddress } from 'src/app/core/utils/common/shorten';
import { PaginatorComponent } from 'src/app/shared/components/paginator/paginator.component';

@Component({
  selector: 'app-community-pool-proposal',
  templateUrl: './community-pool-proposal.component.html',
  styleUrls: ['./community-pool-proposal.component.scss'],
})
export class CommunityPoolProposalComponent implements OnInit {
  @ViewChild(PaginatorComponent) pageChange: PaginatorComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  templates: Array<TableTemplate> = [
    { matColumnDef: 'id', headerCellDef: 'ID' },
    { matColumnDef: 'title', headerCellDef: 'Title' },
    { matColumnDef: 'status', headerCellDef: 'Status' },
    { matColumnDef: 'sender', headerCellDef: 'Sender' },
    { matColumnDef: 'recipient', headerCellDef: 'recipient' },
    { matColumnDef: 'amount', headerCellDef: 'Amount' },
    { matColumnDef: 'voting_end_time', headerCellDef: 'Voting End' },
  ];
  displayedColumns: string[] = this.templates.map((dta) => dta.matColumnDef);
  pageData: PageEvent = {
    length: PAGE_EVENT.LENGTH,
    pageSize: 10,
    pageIndex: PAGE_EVENT.PAGE_INDEX,
  };
  pageSizeMob = 5;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]);
  dataSource: MatTableDataSource<any>;
  dataSourceMob: any[];
  denom = this.environmentService.configValue.chain_info.currencies[0].coinDenom;
  listCoin = this.environmentService.configValue.coins;
  listAssetLcd = [];
  statusConstant = PROPOSAL_STATUS;
  nextKey = null;
  distributionAcc = '';

  constructor(
    public translate: TranslateService,
    public tokenService: TokenService,
    private environmentService: EnvironmentService,
    private layout: BreakpointObserver,
    private proposalService: ProposalService,
    private commonService: CommonService,
  ) {}

  ngOnInit(): void {
    this.getAddressDistribution();
    this.getListProposal();
  }

  async getAddressDistribution() {
    const res = await this.commonService.getAccountDistribution();
    this.distributionAcc = res.data.account.base_account.address;
  }

  shortenAddress(address: string): string {
    if (address) {
      return shortenAddress(address, 8);
    }
    return '';
  }

  paginatorEmit(event): void {
    this.pageData.pageIndex = PAGE_EVENT.PAGE_INDEX;
    if (this.dataSource) {
      this.dataSource.paginator = event;
    } else {
      this.dataSource = new MatTableDataSource<any>();
      this.dataSource.paginator = event;
    }
    this.dataSourceMob = this.dataSource.data.slice(
      this.pageData.pageIndex * this.pageSizeMob,
      this.pageData.pageIndex * this.pageSizeMob + this.pageSizeMob,
    );
  }

  pageEvent(e: PageEvent): void {
    this.pageData.pageIndex = e.pageIndex;
    if (this.pageData.length <= this.pageData.pageSize * (this.pageData.pageIndex + 1)) {
      this.getListProposal();
    } else {
      this.dataSourceMob = this.dataSource.data.slice(
        this.pageData.pageIndex * this.pageSizeMob,
        this.pageData.pageIndex * this.pageSizeMob + this.pageSizeMob,
      );
    }
  }

  getStatus(key: string) {
    let resObj: { value: string; class: string; key: string } = null;
    const statusObj = this.statusConstant.find((s) => s.key === key);
    if (statusObj !== undefined) {
      resObj = {
        value: statusObj.value,
        class: statusObj.class,
        key: statusObj.key,
      };
    }
    return resObj;
  }

  getListProposal() {
    let payload = {
      limit: 40,
      nextKey: this.nextKey,
      type: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
    };
    this.proposalService.getProposalData(payload).subscribe((res) => {
      this.nextKey = res.proposal[res.proposal.length - 1].proposal_id;
      if (res?.proposal) {
        let tempDta = res.proposal;
        if (this.dataSource?.data?.length > 0) {
          this.dataSource.data = [...this.dataSource.data, ...tempDta];
        } else {
          this.dataSource = new MatTableDataSource<any>(tempDta);
        }
      }
      this.dataSourceMob = this.dataSource.data.slice(
        this.pageData.pageIndex * this.pageSizeMob,
        this.pageData.pageIndex * this.pageSizeMob + this.pageSizeMob,
      );
      this.pageData.length = this.dataSource.data.length;
    });
  }
}