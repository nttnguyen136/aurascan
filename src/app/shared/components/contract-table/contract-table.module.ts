import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DateFnsModule } from 'ngx-date-fns';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CustomPipeModule } from 'src/app/core/pipes/custom-pipe.module';
import { MaterialModule } from 'src/app/material.module';
import { DropdownModule } from 'src/app/shared/components/dropdown/dropdown.module';
import { PaginatorModule } from 'src/app/shared/components/paginator/paginator.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { SharedModule } from '../../shared.module';
import { NameTagModule } from '../name-tag/name-tag.module';
import { ContractTableComponent } from './contract-table.component';
import { TooltipCustomizeModule } from '../tooltip-customize/tooltip-customize.module';

@NgModule({
  declarations: [ContractTableComponent],
  imports: [
    CommonModule,
    NgbPopoverModule,
    PaginatorModule,
    TableNoDataModule,
    MaterialModule,
    CustomPipeModule,
    DateFnsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    DropdownModule,
    RouterModule,
    SharedModule,
    NameTagModule,
    TooltipCustomizeModule
  ],
  exports: [ContractTableComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class ContractTableModule {}
