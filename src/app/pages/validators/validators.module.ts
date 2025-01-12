import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { SoulboundFeatureTokensModule } from 'src/app/shared/components/soulbound-feature-tokens/soulbound-feature-tokens.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { MaterialModule } from '../../../app/material.module';
import { CustomPipeModule } from '../../core/pipes/custom-pipe.module';
import { AccountService } from '../../../app/core/services/account.service';
import { BlockService } from '../../../app/core/services/block.service';
import { CommonService } from '../../../app/core/services/common.service';
import { MappingErrorService } from '../../../app/core/services/mapping-error.service';
import { TransactionService } from '../../../app/core/services/transaction.service';
import { SharedModule } from '../../../app/shared/shared.module';
import { PaginatorModule } from '../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { PopupDelegateModule } from './popup-delegate/popup-delegate.module';
import { StakingInfoComponent } from './staking-info/staking-info.component';
import { DelegateItemComponent } from './validators-detail/delegate-item/delegate-item.component';
import { ValidatorsDetailComponent } from './validators-detail/validators-detail.component';
import { ValidatorsRoutingModule } from './validators-routing.module';
import { ValidatorsComponent } from './validators.component';
import { MASK_CONFIG } from 'src/app/app.config';

@NgModule({
  declarations: [ValidatorsComponent, ValidatorsDetailComponent, StakingInfoComponent, DelegateItemComponent],
  imports: [
    CommonModule,
    ValidatorsRoutingModule,
    MaterialModule,
    NgxMaskDirective,
    NgxMaskPipe,
    CustomPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    TableNoDataModule,
    PopupDelegateModule,
    PaginatorModule,
    LayoutModule,
    LoadingImageModule,
    NgbNavModule,
    SoulboundFeatureTokensModule,
    CommonDirectiveModule,
    NameTagModule,
    TooltipCustomizeModule,
  ],
  providers: [
    CommonService,
    BlockService,
    TransactionService,
    AccountService,
    MappingErrorService,
    ProposalService,
    provideEnvironmentNgxMask(MASK_CONFIG),
  ],
})
export class ValidatorsModule {}
