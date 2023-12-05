import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { isEnabled } from 'src/app/app-routing.module';
import { EFeature } from 'src/app/core/models/common.model';
import { NFTDetailComponent } from './nft-detail/nft-detail.component';
import { TokenDetailComponent } from './token-detail/token-detail.component';
import { TokenCw20Component } from './token-list/token-cw20/token-cw20.component';
import { TokenCw721Component } from './token-list/token-cw721/token-cw721.component';

const routes: Routes = [
  {
    path: '',
    component: TokenCw20Component,
    canMatch: [() => isEnabled(EFeature.Cw20)],
  },
  {
    path: 'token',
    component: TokenCw20Component,
    canMatch: [() => isEnabled(EFeature.Cw20)],
  },
  {
    path: 'token/:contractAddress',
    component: TokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw20)],
  },
  {
    path: 'tokens-nft',
    component: TokenCw721Component,
    canMatch: [() => isEnabled(EFeature.Cw721)],
  },
  {
    path: 'token-nft/:contractAddress',
    component: TokenDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw721)],
  },
  {
    path: 'token-nft/:contractAddress/:nftId',
    component: NFTDetailComponent,
    canMatch: [() => isEnabled(EFeature.Cw721)],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TokenRoutingModule {}
