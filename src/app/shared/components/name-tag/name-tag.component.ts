import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LENGTH_CHARACTER } from 'src/app/core/constants/common.constant';
import { CommonService } from 'src/app/core/services/common.service';
import { Globals } from 'src/app/global/global';

@Component({
  selector: 'app-name-tag',
  templateUrl: './name-tag.component.html',
  styleUrls: ['./name-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameTagComponent implements OnInit {
  @Input() value = '';
  @Input() url = 'account';
  @Input() fullWidth = false;
  @Input() fullWidthMob = false;
  @Input() isLink = true;
  @Input() isBox = true;
  @Input() param = '';
  @Input() type = '';
  @Input() isHref = false;
  @Input() iconContract = false;
  @Input() iconVerify = false;
  @Input() paramUrl = '';
  @Input() isTokenDetail = false;

  constructor(public commonService: CommonService, private router: Router, public global: Globals) {}

  ngOnInit(): void {}

  isContractAddress(address) {
    if (address?.startsWith('aura') && address?.length === LENGTH_CHARACTER.CONTRACT) {
      return true;
    }
    return false;
  }
}
