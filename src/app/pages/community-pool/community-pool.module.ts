import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { CustomPaginatorModule } from 'src/app/shared/components/custom-paginator/custom-paginator.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { PaginatorModule } from '../../../app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { CommunityPoolAssetComponent } from './asset-list/community-pool-asset.component';
import { CommunityPoolRoutingModule } from './community-pool-routing.module';
import { CommunityPoolComponent } from './community-pool.component';
import { CommunityPoolProposalComponent } from './proposal-list/community-pool-proposal.component';
import { MASK_CONFIG } from 'src/app/app.config';
import { MaterialModule } from 'src/app/material.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';

@NgModule({
  declarations: [CommunityPoolAssetComponent, CommunityPoolProposalComponent, CommunityPoolComponent],
  imports: [
    CommunityPoolRoutingModule,
    CommonModule,
    SharedModule,
    TranslateModule,
    PaginatorModule,
    TableNoDataModule,
    FormsModule,
    CustomPipeModule,
    NgxMaskPipe,
    NgxMaskDirective,
    CommonDirectiveModule,
    CustomPaginatorModule,
    NameTagModule,
    MaterialModule,
    TooltipCustomizeModule,
  ],
  providers: [ProposalService, provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class CommunityPoolModule {}
