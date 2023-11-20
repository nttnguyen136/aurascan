import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { EnvironmentService } from '../../../core/data-services/environment.service';
import { NotificationsService } from 'src/app/core/services/notifications.service';

@Component({
  selector: 'app-authenticate-mail',
  templateUrl: './authenticate-mail.component.html',
  styleUrls: ['./authenticate-mail.component.scss'],
})
export class AuthenticateMailComponent implements OnDestroy {
  userEmail = null;

  @ViewChild('offcanvasWallet') offcanvasWallet: ElementRef;
  @ViewChild('buttonDismiss') buttonDismiss: ElementRef<HTMLButtonElement>;
  @ViewChild('connectButton') connectButton: ElementRef<HTMLButtonElement>;

  chainId = this.envService.chainId;
  isMobileMatched = false;
  breakpoint$ = this.layout.observe([Breakpoints.Small, Breakpoints.XSmall]).pipe(
    tap((state) => {
      if (state) {
        this.isMobileMatched = state.matches;
      }
    }),
  );

  destroy$ = new Subject<void>();
  constructor(
    private envService: EnvironmentService,
    private layout: BreakpointObserver,
    private router: Router,
    private route: ActivatedRoute,
    private notificationsService: NotificationsService,
  ) {}

  ngOnInit(): void {
    this.userEmail = localStorage.getItem('userEmail');
  }

  ngOnDestroy(): void {
    document.removeAllListeners('hide.bs.offcanvas');
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(): void {
    this.buttonDismiss.nativeElement.click();
  }

  disconnect(): void {
    // remove current fcm token
    this.notificationsService.deleteToken(this.notificationsService.currentFcmToken).subscribe(
      (res) => {},
      () => (this.notificationsService.currentFcmToken = null),
      () => (this.notificationsService.currentFcmToken = null),
    );

    // logout Google
    this.userEmail = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('listNameTag');
    localStorage.removeItem('lstWatchList');
    localStorage.removeItem('registerFCM');

    // check is screen profile
    if (this.route.snapshot['_routerState']?.url === '/profile') {
      this.router.navigate(['/']);
    }

    setTimeout(() => {
      location.reload();
    }, 1000);
  }

  linkLogin() {
    this.router.navigate(['login']);
    if (this.router.navigated) {
      this.router.onSameUrlNavigation = 'reload';
    }
  }
}
