import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { CommonPipeModule } from 'src/app/core/pipes/common-pipe.module';
import { ProposalService } from 'src/app/core/services/proposal.service';
import { PaginatorModule } from '../../../app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../../app/shared/shared.module';
import { CommunityPoolAssetComponent } from './asset-list/community-pool-asset.component';
import { CommunityPoolRoutingModule } from './community-pool-routing.module';
import { CommunityPoolProposalComponent } from './proposal-list/community-pool-proposal.component';
import { CommunityPoolComponent } from './community-pool.component';

@NgModule({
  declarations: [CommunityPoolAssetComponent, CommunityPoolProposalComponent, CommunityPoolComponent],
  imports: [
    CommunityPoolRoutingModule,
    CommonModule,
    SharedModule,
    TranslateModule,
    PaginatorModule,
    TableNoDataModule,
    MatTableModule,
    FormsModule,
    CommonPipeModule,
    NgxMaskModule,
    CommonDirectiveModule,
  ],
  providers: [ProposalService],
})
export class CommunityPoolModule {}