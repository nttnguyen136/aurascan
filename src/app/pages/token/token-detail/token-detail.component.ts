import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { filter, take } from 'rxjs';
import { DATEFORMAT, STORAGE_KEYS, TIMEOUT_ERROR } from 'src/app/core/constants/common.constant';
import { TYPE_CW4973 } from 'src/app/core/constants/contract.constant';
import { ContractRegisterType } from 'src/app/core/constants/contract.enum';
import { EModeToken } from 'src/app/core/constants/token.enum';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { ContractService } from 'src/app/core/services/contract.service';
import { IBCService } from 'src/app/core/services/ibc.service';
import { TokenService } from 'src/app/core/services/token.service';
import { balanceOf } from 'src/app/core/utils/common/parsing';
import local from 'src/app/core/utils/storage/local';

@Component({
  selector: 'app-token-detail',
  templateUrl: './token-detail.component.html',
  styleUrls: ['./token-detail.component.scss'],
})
export class TokenDetailComponent implements OnInit {
  loading = true;
  contractAddress = '';
  tokenDetail: any;
  image_s3 = this.environmentService.imageUrl;
  defaultLogoToken = this.image_s3 + 'images/icons/token-logo.png';
  contractType = ContractRegisterType;
  errTxt: string;
  EModeToken = EModeToken;

  chainInfo = this.environmentService.chainInfo;

  constructor(
    private router: ActivatedRoute,
    private tokenService: TokenService,
    private environmentService: EnvironmentService,
    private contractService: ContractService,
    private datePipe: DatePipe,
    private ibcService: IBCService,
  ) {}

  ngOnInit(): void {
    const paramData = this.router.snapshot.paramMap.get('contractAddress');
    if (paramData?.startsWith(this.chainInfo.bech32Config.bech32PrefixAccAddr)) {
      this.contractAddress = paramData;
      if (this.router.snapshot.url[0]?.path === 'token') {
        this.getTokenDetail();
      } else {
        this.getTokenDetailNFT();
      }
    } else {
      this.getDataCoin(paramData);
    }
  }

  getTokenDetail(): void {
    let now = new Date();
    now.setDate(now.getDate() - 1);
    this.tokenService
      .getTokenDetail(this.contractAddress, this.datePipe.transform(now, DATEFORMAT.DATE_ONLY))
      .subscribe({
        next: (res) => {
          const data = _.get(res, `smart_contract`);
          if (data.length > 0) {
            this.tokenService.tokensMarket$
              .pipe(
                filter((data) => _.isArray(data)),
                take(1),
              )
              .subscribe((item) => {
                const tokenMarket = item.find((token) => token.contract_address === data[0].address);

                const token = data[0];
                // const tokenMarket = item.length > 0 ? item[0] : null;
                token.contract_address = token.address;
                token.name = tokenMarket?.name || token.cw20_contract.name;
                token.symbol = tokenMarket?.symbol || token.cw20_contract.symbol;
                token.decimals = token.cw20_contract.decimal;
                token.type = this.contractType.CW20;
                token.max_total_supply = tokenMarket?.max_supply || 0;
                token.circulating_market_cap = tokenMarket?.circulating_market_cap || 0;
                token.price = tokenMarket?.current_price || 0;
                token.verify_status = tokenMarket?.verify_status || '';
                token.verify_text = tokenMarket?.verify_text || '';
                token.modeToken = EModeToken.CWToken;
                token.fully_diluted_market_cap =
                  tokenMarket?.fully_diluted_valuation || token.max_total_supply * token.price;
                token.price_change_percentage_24h = tokenMarket?.price_change_percentage_24h || 0;
                token.contract_verification = token.code?.code_id_verifications[0]?.verification_status;
                this.tokenDetail = token;
              });
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

  getTokenDetailNFT(): void {
    this.contractService.loadContractDetail(this.contractAddress).subscribe({
      next: (res) => {
        const name = _.get(res, 'smart_contract[0].cw721_contract.name');
        let type = ContractRegisterType.CW721;
        if (res.smart_contract[0]?.name === TYPE_CW4973) {
          type = ContractRegisterType.CW4973;
        }
        const isNFTContract = true;
        const contract_address = _.get(res, 'smart_contract[0].address');
        const modeToken = EModeToken.CWToken;
        this.tokenDetail = { name, type, contract_address, isNFTContract, modeToken };
        this.tokenDetail.contract_verification =
          res.smart_contract[0].code.code_id_verifications[0]?.verification_status;
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

  getLength(result: string) {
    this.tokenDetail['totalTransfer'] = Number(result) || 0;
  }

  getMoreTx(event) {
    this.tokenDetail['hasMoreTx'] = event;
  }

  async getDataCoin(denom) {
    const listTokenIBC = local.getItem<any>(STORAGE_KEYS.LIST_TOKEN_IBC);
    let findData = listTokenIBC?.find((k) => k['denom']?.indexOf(denom) > 0);
    this.getDenomHolder(findData);
  }

  async getDenomHolder(data) {
    let totalSupply = 0;
    if (data?.denom) {
      const tempDenom = await this.ibcService.getTotalSupplyLCD(encodeURIComponent(data?.denom));
      totalSupply = _.get(tempDenom, 'data.amount.amount' || 0);
    }
    const decimals = data?.decimal || this.chainInfo?.currencies[0].coinDecimals;

    this.tokenDetail = {
      modeToken: data?.denom ? EModeToken.IBCCoin : EModeToken.StakingCoin,
      denomHash: data?.denom,
      name: data?.name,
      price: data?.current_price,
      symbol: data?.symbol || data?.display,
      isValueUp: data?.price_change_percentage_24h && data?.price_change_percentage_24h >= 0,
      change: data?.price_change_percentage_24h || 0,
      decimals,
      totalSupply,
    };

    this.ibcService.getDenomHolder(data?.denom).subscribe((res) => {
      this.tokenDetail['holder'] = _.get(res, 'account_aggregate.aggregate.count');
    });
    this.loading = false;
  }
}
