import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatLegacySelect as MatSelect } from '@angular/material/legacy-select';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import BigNumber from 'bignumber.js';
import { ChartComponent } from 'ng-apexcharts';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EFeature } from 'src/app/core/models/common.model';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { SoulboundService } from 'src/app/core/services/soulbound.service';
import { UserService } from 'src/app/core/services/user.service';
import local from 'src/app/core/utils/storage/local';
import { EnvironmentService } from '../../../../app/core/data-services/environment.service';
import { WalletService } from '../../../../app/core/services/wallet.service';
import { ACCOUNT_WALLET_COLOR } from '../../../core/constants/account.constant';
import { ACCOUNT_WALLET_COLOR_ENUM, WalletAcount } from '../../../core/constants/account.enum';
import { DATE_TIME_WITH_MILLISECOND, STORAGE_KEYS } from '../../../core/constants/common.constant';
import { AccountService } from '../../../core/services/account.service';
import { CommonService } from '../../../core/services/common.service';
import { chartCustomOptions, ChartOptions, CHART_OPTION } from './chart-options';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {
  @ViewChild('assetTypeSelect') assetTypeSelect: MatSelect;
  @HostListener('window:scroll', ['$event'])
  closeOptionPanelSection(_) {
    if (this.assetTypeSelect !== undefined) {
      this.assetTypeSelect.close();
    }
  }
  public chartOptions: Partial<ChartOptions>;
  @ViewChild('walletChart') chart: ChartComponent;
  @ViewChild(MatSort) sort: MatSort;

  currentAddress: string;
  currentAccountDetail: any;
  chartCustomOptions = chartCustomOptions;

  // loading param check
  userAddress = '';
  modalReference: any;
  isNoData = false;
  userEmail = '';

  destroyed$ = new Subject<void>();

  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(takeUntil(this.destroyed$));
  timeStaking = `${this.environmentService.stakingTime}`;

  totalValueToken = 0;
  totalValueNft = 0;
  totalAssets = 0;
  totalSBTPick = 0;
  totalSBT = 0;
  isContractAddress = false;
  isWatchList = false;
  EFeature = EFeature;

  constructor(
    public commonService: CommonService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private walletService: WalletService,
    private layout: BreakpointObserver,
    private modalService: NgbModal,
    private environmentService: EnvironmentService,
    private soulboundService: SoulboundService,
    private router: Router,
    private nameTagService: NameTagService,
    private userService: UserService,
  ) {
    this.chartOptions = CHART_OPTION();
  }

  get totalValue() {
    return BigNumber(this.totalValueToken).minus(this.totalValueNft);
  }

  ngOnInit(): void {
    this.timeStaking = (Number(this.timeStaking) / DATE_TIME_WITH_MILLISECOND).toString();
    this.chartCustomOptions = [...ACCOUNT_WALLET_COLOR];

    this.userService.user$?.pipe(takeUntil(this.destroyed$)).subscribe((currentUser) => {
      this.userEmail = currentUser ? currentUser.email : null;
    });

    this.route.params.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      if (params?.address) {
        this.currentAddress = params?.address;
        this.isContractAddress = this.commonService.isValidContract(this.currentAddress);
        this.loadDataTemp();
        this.getAccountDetail();
        this.checkWatchList();
      }
    });
  }

  /**
   * ngOnDestroy
   */
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  loadDataTemp(): void {
    //get data from client for my account
    this.walletService.wallet$.subscribe((wallet) => {
      if (wallet) {
        this.userAddress = wallet.bech32Address;
      }
      this.getSBTPick();
      this.getTotalSBT();
    });
  }

  getAccountDetail(): void {
    this.isNoData = false;
    const halftime = 15000;
    this.accountService.getAccountDetail(this.currentAddress).subscribe(
      (res) => {
        if (res.data.code === 200 && !res.data?.data) {
          this.isNoData = true;
          setTimeout(() => {
            this.getAccountDetail();
          }, halftime);
          return;
        }

        if (res?.data) {
          this.currentAccountDetail = res.data;
          this.chartOptions.series = [];
          if (+this.currentAccountDetail.commission > 0) {
            this.chartOptions.labels.push(ACCOUNT_WALLET_COLOR_ENUM.Commission);
            this.chartOptions.colors.push(WalletAcount.Commission);
            this.chartCustomOptions.push({
              name: ACCOUNT_WALLET_COLOR_ENUM.Commission,
              color: WalletAcount.Commission,
              amount: '0.000000',
            });
          } else {
            this.chartCustomOptions = chartCustomOptions;
          }

          this.chartCustomOptions.forEach((f) => {
            switch (f.name) {
              case ACCOUNT_WALLET_COLOR_ENUM.Available:
                f.amount = this.currentAccountDetail.available;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Delegated:
                f.amount = this.currentAccountDetail.delegated;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.StakingReward:
                f.amount = this.currentAccountDetail.stake_reward;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Commission:
                f.amount = this.currentAccountDetail.commission;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.Unbonding:
                f.amount = this.currentAccountDetail.unbonding;
                break;
              case ACCOUNT_WALLET_COLOR_ENUM.DelegableVesting:
                f.amount = this.currentAccountDetail?.delegable_vesting;
                break;
              default:
                break;
            }
            f.amount = f.amount || '0';
            this.chartOptions.series.push(Number(f.amount));
          });
        }
      },
      () => {},
      () => {},
    );
  }

  viewQrAddress(staticDataModal: any): void {
    this.modalReference = this.modalService.open(staticDataModal, {
      keyboard: false,
      centered: true,
      size: 'sm',
      windowClass: 'modal-holder contact-qr-modal',
    });
  }

  closePopup() {
    this.modalReference.close();
  }

  reloadData() {
    location.reload();
  }

  getSBTPick() {
    const payload = {
      limit: 100,
      offset: 0,
      receiverAddress: this.currentAddress,
      isEquipToken: true,
    };

    this.soulboundService.getListSoulboundByAddress(payload).subscribe(
      (res) => {
        this.totalSBTPick = res.data.length;
      },
      () => {},
      () => {},
    );
  }

  getTotalSBT() {
    this.soulboundService.countTotalABT(this.currentAddress).subscribe(
      (res) => {
        this.totalSBT = res.data;
      },
      () => {},
      () => {},
    );
  }

  extendLink(url) {
    url = url.match(/^https?:/) ? url : '//' + url;
    return url;
  }

  editPrivateName() {
    const dataNameTag = this.nameTagService.listNameTag?.find((k) => k.address === this.currentAddress);
    if (this.userEmail) {
      if (dataNameTag) {
        local.setItem(STORAGE_KEYS.SET_ADDRESS_NAME_TAG, dataNameTag);
      } else {
        local.setItem(STORAGE_KEYS.SET_ADDRESS_NAME_TAG, { address: this.currentAddress });
      }
      this.router.navigate(['/profile'], { queryParams: { tab: 'private' } });
    } else {
      this.router.navigate(['/login']);
    }
  }

  checkWatchList() {
    // get watch list form local storage
    const lstWatchList = local.getItem<any>(STORAGE_KEYS.LIST_WATCH_LIST);
    if (lstWatchList?.find((k) => k.address === this.currentAddress)) {
      this.isWatchList = true;
    }
  }

  handleWatchList() {
    if (this.isWatchList) {
      this.router.navigate(['/profile'], { queryParams: { tab: 'watchList' } });
    } else {
      this.editWatchList();
    }
  }

  editWatchList() {
    if (this.userEmail) {
      local.setItem(STORAGE_KEYS.SET_ADDRESS_WATCH_LIST, this.currentAddress);
      this.router.navigate(['/profile'], { queryParams: { tab: 'watchList' } });
    } else {
      this.router.navigate(['/login']);
    }
  }
}
