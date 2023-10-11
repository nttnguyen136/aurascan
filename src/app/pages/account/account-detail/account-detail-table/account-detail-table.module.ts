import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyPaginatorModule as MatPaginatorModule } from '@angular/material/legacy-paginator';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskDirective, NgxMaskPipe, provideEnvironmentNgxMask } from 'ngx-mask';
import { MASK_CONFIG } from 'src/app/app.config';
import { CommonDirectiveModule } from 'src/app/core/directives/common-directive.module';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { CommonPipeModule } from '../../../../core/pipes/common-pipe.module';
import { PaginatorModule } from '../../../../shared/components/paginator/paginator.module';
import { TableNoDataModule } from '../../../../shared/components/table-no-data/table-no-data.module';
import { AccountDetailTableComponent } from './account-detail-table.component';

@NgModule({
  declarations: [AccountDetailTableComponent],
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    TranslateModule,
    CommonPipeModule,
    RouterModule,
    TableNoDataModule,
    PaginatorModule,
    LoadingImageModule,
    NgxMaskPipe,
    NgxMaskDirective,
    CommonDirectiveModule,
  ],
  exports: [AccountDetailTableComponent],
  providers: [provideEnvironmentNgxMask(MASK_CONFIG)],
})
export class AccountDetailTableModule {}
