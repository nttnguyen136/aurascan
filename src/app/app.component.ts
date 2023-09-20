import { Component, OnInit } from '@angular/core';
import { TOKEN_ID_GET_PRICE } from './core/constants/common.constant';
import { CommonService } from './core/services/common.service';
import { TokenService } from './core/services/token.service';
import { getInfo } from './core/utils/common/info-common';
import { Globals } from './global/global';
// import eruda from 'eruda';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { forkJoin } from 'rxjs';
import { NameTagService } from './core/services/name-tag.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  // chainInfo = this.env.configValue.chain_info;
  // TESTNET = ['aura-testnet-2', 'serenity-testnet-001'];
  // isTestnet = this.TESTNET.includes(
  //   this.chainInfo?.chainId || ''
  // );
  constructor(
    private commonService: CommonService,
    private globals: Globals,
    private tokenService: TokenService,
    private nameTagService: NameTagService,
  ) {}
  ngOnInit(): void {
    this.getListNameTag();
    this.getInfoCommon();
    this.getPriceToken();

    setInterval(() => {
      this.getInfoCommon();
      this.getPriceToken();
    }, 60000);

    setInterval(() => {
      this.getListNameTag();
    }, 20000);

    // if (this.isTestnet) {
    //   let el = document.createElement('div');
    //   document.body.appendChild(el);
    //
    //   eruda.init({
    //     container: el,
    //     tool: ['console', 'elements', 'resources', 'network'],
    //   });
    // }
  }

  getInfoCommon(): void {
    this.commonService.status().subscribe((res) => {
      getInfo(this.globals, res);
    });
  }

  getPriceToken(): void {
    this.tokenService.getPriceToken(TOKEN_ID_GET_PRICE.AURA).subscribe((res) => {
      this.globals.price.aura = res.data || 0;
    });

    this.tokenService.getPriceToken(TOKEN_ID_GET_PRICE.BTC).subscribe((res) => {
      this.globals.price.btc = res.data || 0;
    });
  }

  getListNameTag(): void {
    const payload = {
      limit: 500,
      nextKey: 0,
    };

    const payloadPrivate = {
      limit: 100,
      offset: 0,
      keyword: null,
    };

    // get list name tag if not login email
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      this.commonService.getListNameTag(payload).subscribe((res) => {
        this.globals.listNameTag = this.commonService.listNameTag = res.data?.nameTags;
      });
      return;
    }

    // get list name tag if login email
    forkJoin({
      publicName: this.commonService.getListNameTag(payload),
      privateName: this.nameTagService.getListPrivateNameTag(payloadPrivate),
    }).subscribe(({ publicName, privateName }) => {
      let listTemp = publicName.data?.nameTags?.map((element) => {
        const address = _.get(element, 'address');
        let name_tag = _.get(element, 'name_tag');
        let isPrivate = false;
        let name_tag_private = null;
        let id;
        const enterpriseUrl = _.get(element, 'enterpriseUrl');
        let privateData = privateName?.data?.find((k) => k.address === address);
        if (privateData) {
          name_tag_private = privateData.nameTag;
          isPrivate = true;
          id = privateData.id;
        }
        return { address, name_tag, isPrivate, enterpriseUrl, name_tag_private, id};
      });

      // get other data of private list
      const isSameUser = (listTemp, privateName) => listTemp?.address === privateName.address;
      const onlyInLeft = (left, right, compareFunction) =>
        left.filter((leftValue) => !right.some((rightValue) => compareFunction(leftValue, rightValue)));
      const lstPrivate = onlyInLeft(privateName?.data, listTemp, isSameUser);
      lstPrivate.forEach((element) => {
        element['name_tag_private'] = element.nameTag;
        element['nameTag'] = null;
        element['isPrivate'] = true;
      });
      const result = [...listTemp, ...lstPrivate];
      this.globals.listNameTag = this.commonService.listNameTag = result;
    });
  }
}
