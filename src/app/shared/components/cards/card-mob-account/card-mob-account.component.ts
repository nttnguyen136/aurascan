import { Component, Input, OnInit } from '@angular/core';
import { CodeTransaction } from '../../../../core/constants/transaction.enum';
import { CommonService } from 'src/app/core/services/common.service';
import { TabsAccount } from 'src/app/core/constants/account.enum';

export interface CardMobSimpleValidatorAddress {
  imgUrl: string;
  validatorName: string;
  validatorAddress: string;
  validatorNumber: string;
  validatorIdentity: string;
}

export interface CardMobSimpleTitle {
  size: 'sm' | 'md' | 'lg';
  label: string;
  titleClass?: string;
  subLabelContent: string;
  subLabelClass?: string;
  rankNum?: number;
  status?: number;
  isFail?: boolean;
}
export interface CardMobSimpleContent {
  label: string;
  class?: string;
  info: any;
}

export interface CardMobSimpleToken {
  logo: string;
  name: string;
  class?: string;
  info?: any;
}

export interface CardMobSimpleAmount {
  amount: string;
  decimal: number;
  isAura: boolean;
}

@Component({
  selector: 'app-card-mob-account',
  templateUrl: './card-mob-account.component.html',
  styleUrls: ['./card-mob-account.component.scss'],
})
export class CardMobAccountComponent implements OnInit {
  @Input() link: string;
  @Input() title: CardMobSimpleTitle;
  @Input() validatorData: CardMobSimpleValidatorAddress;
  @Input() content: CardMobSimpleContent[];
  @Input() tokenData: CardMobSimpleToken;
  @Input() tokenAmount: CardMobSimpleAmount;
  @Input() dataCard: any;
  @Input() modeQuery: string;

  tabsData = TabsAccount;
  statusTransaction = CodeTransaction;

  constructor(public commonService: CommonService) {}

  ngOnInit(): void {
    if (this.modeQuery !== this.tabsData.ExecutedTxs) {
      this.content[this.content.length - 1].label = 'Expand';
    }
  }

  expandData(data) {
    if (data.arrEvent?.length <= 1) {
      return;
    }

    data.expand = true;
  }
}
