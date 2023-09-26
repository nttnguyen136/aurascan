import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';

@Injectable()
export class NameTagService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  getListPrivateNameTag(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.get<any>(`${this.apiUrl}/user/private-name-tag`, {
      params,
    });
  }

  createPrivateName(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.post<any>(`${this.apiUrl}/user/private-name-tag`, params);
  }

  deletePrivateNameTag(id) {
    return this.http.delete<any>(`${this.apiUrl}/user/private-name-tag/${id}`);
  }

  updatePrivateNameTag(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.patch<any>(`${this.apiUrl}/user/private-name-tag/${payload.id}`, params);
  }

  getListPrivateNameTagNextKey(payload) {
    const params = _(payload).omitBy(_.isNull).omitBy(_.isUndefined).value();
    return this.http.get<any>(`${this.apiUrl}/private-name-tag`, {
      params,
    });
  }
}