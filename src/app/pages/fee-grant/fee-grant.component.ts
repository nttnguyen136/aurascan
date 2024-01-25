import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { WalletsService } from 'src/app/core/services/wallets.service';

@Component({
  selector: 'app-fee-grant',
  templateUrl: './fee-grant.component.html',
  styleUrls: ['./fee-grant.component.scss'],
})
export class FeeGrantComponent implements OnInit {
  isGrantees = true;
  currentAddress = null;
  isLoading = true;
  TAB = [
    {
      id: 0,
      value: 'My Grantees',
    },
    {
      id: 1,
      value: 'My Granters',
    },
  ];
  constructor(private walletService: WalletsService) {}

  ngOnInit(): void {
    from([1])
      .pipe(
        delay(600),
        mergeMap((_) => this.walletService.walletAccount$),
      )
      .subscribe((wallet) => {
        if (wallet) {
          this.currentAddress = wallet.address;
        } else {
          this.currentAddress = null;
        }
        this.isLoading = false;
      });
  }

  changeType(type: boolean) {
    this.isGrantees = type;
  }
}
