import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';

@Injectable()
export class EnableRouter implements CanLoad {
  configValue = this.env.configValue;
  constructor(private env: EnvironmentService, private router: Router) {}

  /* 
    "features": [
        "dashboard",
        "validators",
        "blocks",
        "transaction",
        "votings",
        "tokens",
        "statistics",
        "contracts",
        "code-ids",
        "fee-grant",
        "accountbound",
        "community-pool",
        "login",
        "user",
        "profile",
        "account"
    ]
  */

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    const features = this.configValue?.features;

    const path = route.path;

    console.log(path);

    if (features?.length > 0 && !features.includes(path)) {
      return this.router.navigate(['']);
    }

    return true;
  }
}
