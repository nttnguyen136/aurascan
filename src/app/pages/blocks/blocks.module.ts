import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TooltipCustomizeModule } from 'src/app/shared/components/tooltip-customize/tooltip-customize.module';
import { MaterialModule } from '../../../app/material.module';
import { CustomPipeModule } from '../../core/pipes/custom-pipe.module';
import { BlockService } from '../../../app/core/services/block.service';
import { SharedModule } from '../../../app/shared/shared.module';
import { TableNoDataModule } from '../../shared/components/table-no-data/table-no-data.module';
import { BlockDetailComponent } from './block-detail/block-detail.component';
import { BlocksRoutingModule } from './blocks-routing.module';
import { BlocksComponent } from './blocks.component';
import { MASK_CONFIG } from 'src/app/app.config';

@NgModule({
  declarations: [BlocksComponent, BlockDetailComponent],
  imports: [
    CommonModule,
    BlocksRoutingModule,
    MaterialModule,
    NgxMaskPipe,
    NgxMaskDirective,
    CustomPipeModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    SharedModule,
    TableNoDataModule,
    NgbNavModule,
    PaginatorModule,
    CommonDirectiveModule,
    TooltipCustomizeModule,
    ClipboardModule,
  ],
  providers: [BlockService, provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class BlocksModule {}
