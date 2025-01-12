import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { EnvironmentService } from 'src/app/core/data-services/environment.service';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';
import { LENGTH_CHARACTER, STORAGE_KEYS } from '../../../app/core/constants/common.constant';
import { TransactionService } from '../../core/services/transaction.service';
import { MENU, MenuName } from './menu';
import { MenuItem } from './menu.model';

@Component({
  selector: 'app-horizontaltopbar',
  templateUrl: './horizontaltopbar.component.html',
  styleUrls: ['./horizontaltopbar.component.scss'],
})

/**
 * Horizontal-Topbar Component
 */
export class HorizontaltopbarComponent implements OnInit, OnDestroy {
  menuItems: MenuItem[] = MENU;

  searchValue = null;
  pageTitle = null;
  menuName = MenuName;
  menuLink = [];
  currentAddress = null;
  userEmail: string;

  prefixValAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixValAddr;
  prefixNormalAdd = this.environmentService.chainInfo.bech32Config.bech32PrefixAccAddr;

  destroy$ = new Subject();

  constructor(
    public router: Router,
    public translate: TranslateService,
    private transactionService: TransactionService,
    private environmentService: EnvironmentService,
    private nameTagService: NameTagService,
    private notificationsService: NotificationsService,
    private userService: UserService,
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.getMenuLink();
    this.checkEnv();
    this.checkFeatures();

    this.userService.user$?.pipe(takeUntil(this.destroy$)).subscribe((currentUser) => {
      this.userEmail = currentUser ? currentUser.email : null;
    });
  }

  checkFeatures() {
    const features = this.environmentService.chainConfig.features;

    if (features.length > 0) {
      this.menuItems.forEach((item) => {
        if (item.subItems) {
          let isEnabledMenu = false;
          item.subItems.forEach((subItem) => {
            const featureName = subItem.featureName;

            const foundIndex = features.findIndex((item) => item === featureName);

            // If have featureName, check disable
            subItem.disabled = featureName ? (foundIndex < 0 ? true : false) : false;

            isEnabledMenu = subItem.disabled ? true : isEnabledMenu;
          });
        } else {
          const featureName = item.featureName;
          const foundIndex = features.findIndex((item) => item === featureName);
          item.disabled = foundIndex < 0 ? true : false;
        }
      });
    }
  }

  checkEnv() {
    this.pageTitle = this.environmentService.isMobile
      ? this.environmentService.environment.label.mobile
      : this.environmentService.environment.label.desktop;
  }

  async handleSearch() {
    const VALIDATORS = {
      HASHRULE: /^[A-Za-z0-9]/,
    };
    const regexRule = VALIDATORS.HASHRULE;
    if (this.searchValue) {
      this.searchValue = this.searchValue.trim();
      const addressNameTag = this.nameTagService.findAddressByNameTag(this.searchValue);
      if (addressNameTag?.length > 0) {
        let urlLink = addressNameTag.length === LENGTH_CHARACTER.CONTRACT ? 'contracts' : 'account';
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([urlLink, addressNameTag]);
        });
      }

      let isNumber = /^\d+$/.test(this.searchValue);
      if (regexRule.test(this.searchValue)) {
        //check is start with 'aura' and length >= normal address
        if (this.searchValue.startsWith(this.prefixNormalAdd) && this.searchValue.length >= LENGTH_CHARACTER.ADDRESS) {
          if (this.searchValue.length === LENGTH_CHARACTER.CONTRACT) {
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate(['contracts', this.searchValue]);
            });
          } else {
            let urlLink = this.searchValue.startsWith(this.prefixValAdd) ? 'validators' : 'account';
            this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
              this.router.navigate([urlLink, this.searchValue]);
            });
          }
        } else if (this.searchValue.length === LENGTH_CHARACTER.TRANSACTION) {
          this.getTxhDetail(this.searchValue);
        } else if (isNumber) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['blocks', this.searchValue]);
          });
        }
      }
    }
  }

  getTxhDetail(value): void {
    const payload = {
      limit: 1,
      hash: decodeURI(value),
    };
    this.transactionService.getListTx(payload).subscribe(
      (res) => {
        if (res?.transaction?.length > 0) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate(['transaction', this.searchValue]);
          });
        } else {
          this.searchValue = '';
        }
      },
      (error) => {
        this.searchValue = '';
      },
    );
  }

  getMenuLink() {
    for (let menu of this.menuItems) {
      if (!menu.subItems) {
        this.menuLink.push(menu.link);
      } else {
        let arr = '';
        for (let subMenu of menu.subItems) {
          arr += subMenu.link;
        }
        this.menuLink.push(arr);
      }
    }
  }

  checkMenuActive(menuLink: string) {
    if ((this.router.url === '/' || this.router.url === '/dashboard') && menuLink === '/dashboard') {
      return true;
    }

    if (!menuLink.includes('/tokens')) {
      if (menuLink === '/' + this.router.url.split('/')[1] && this.router.url.includes(menuLink)) {
        return true;
      }
    }

    if (menuLink === '/tokens' && (this.router.url == '/tokens' || this.router.url.includes('/tokens/token/'))) {
      return true;
    }

    if (
      menuLink === '/tokens/tokens-nft' &&
      (this.router.url == '/tokens/tokens-nft' || this.router.url.includes('/tokens/token-nft'))
    ) {
      return true;
    }

    if (
      menuLink === '/tokens/token-abt' &&
      (this.router.url == '/tokens/token-abt' || this.router.url.includes('/tokens/token-abt'))
    ) {
      return true;
    }

    if (
      menuLink === '/statistics/charts-stats' &&
      (this.router.url == '/statistics/charts-stats' || this.router.url.includes('/statistics/chart/'))
    ) {
      return true;
    }

    if (menuLink === '/statistics/top-statistic' && this.router.url == '/statistics/top-statistic') {
      return true;
    }

    if (
      menuLink === '/code-ids' &&
      (this.router.url == '/code-ids' ||
        this.router.url.includes('/code-ids/detail/') ||
        this.router.url.includes('/code-ids/verify/'))
    ) {
      return true;
    }

    return false;
  }

  removeConfigCSV(data) {
    if (data.link === '/export-csv') {
      local.removeItem(STORAGE_KEYS.SET_DATA_EXPORT);
    }
  }
}
