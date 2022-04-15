import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ProposalService } from '../../../../../app/core/services/proposal.service';
import { balanceOf } from '../../../../core/utils/common/parsing';

export interface IDepositor {
  depositors: string;
  txHash: string;
  amount: number;
  created_at: string;
}
@Component({
  selector: 'app-depositors',
  templateUrl: './depositors.component.html',
  styleUrls: ['./depositors.component.scss'],
})
export class DepositorsComponent implements OnInit {
  @Input() proposalId: number;
  voteDataList: IDepositor[] = [];
  _voteList: IDepositor[] = [];

  constructor(private proposalService: ProposalService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.proposalService.getDepositors(this.proposalId).subscribe((res) => {
      this.voteDataList = [...res.data.result];
      this.voteDataList.forEach((item) => {
        item.amount = balanceOf(item.amount)
      });
    });
  }
}
