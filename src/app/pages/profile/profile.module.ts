import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMaskModule } from 'ngx-mask';
import { NameTagService } from 'src/app/core/services/name-tag.service';
import { UserService } from 'src/app/core/services/user.service';
import { APaginatorModule } from 'src/app/shared/components/a-paginator/a-paginator.module';
import { LoadingImageModule } from 'src/app/shared/components/loading-image/loading-image.module';
import { NameTagModule } from 'src/app/shared/components/name-tag/name-tag.module';
import { TableNoDataModule } from 'src/app/shared/components/table-no-data/table-no-data.module';
import { MaterialModule } from '../../app.module';
import { CommonPipeModule } from '../../core/pipes/common-pipe.module';
import { SharedModule } from '../../shared/shared.module';
import { PopupNameTagComponent } from './popup-name-tag/popup-name-tag.component';
import { PrivateNameTagComponent } from './private-name-tag/private-name-tag.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileSettingsComponent } from './profile-settings/profile-settings.component';
import { ProfileComponent } from './profile.component';

@NgModule({
  declarations: [ProfileComponent, ProfileSettingsComponent, PrivateNameTagComponent, PopupNameTagComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProfileRoutingModule,
    SharedModule,
    MaterialModule,
    TranslateModule,
    CommonPipeModule,
    NgxMaskModule,
    LoadingImageModule,
    ReactiveFormsModule,
    NameTagModule,
    MatIconModule,
    NgbNavModule,
    TableNoDataModule,
    APaginatorModule,
  ],
  providers: [FormBuilder, UserService, NameTagService],
})
export class ProfileModule {}
