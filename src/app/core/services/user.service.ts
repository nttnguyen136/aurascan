import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { map } from 'rxjs/operators';

@Injectable()
export class UserService extends CommonService {
  chainInfo = this.environmentService.configValue.chain_info;

  constructor(private http: HttpClient, private environmentService: EnvironmentService) {
    super(http, environmentService);
  }

  registerUser(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/register-with-password`, payload);
  }

  loginWithPassword(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login-with-password`, payload);
  }

  changePassword(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/change-password`, payload);
  }

  resendVerifyEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/resend-verification-email/${email}`);
  }

  sendResetPasswordEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/auth/send-reset-password-email/${email}`);
  }

  resetPasswordWithCode(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/reset-password`, payload);
  }

  loginWithGoogle(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/google`, payload);
  }

  refreshToken(payload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, payload);
  }

  getListTxByAddress(payload) {
    const operationsDoc = `
    query QueryTxOfAccount(
      $compositeKey: String = null, 
      $address: String = null, 
      $startTime: timestamptz = null,
      $endTime: timestamptz = null,
      $limit: Int = null,
      $listTxMsgType: [String!] = null,
      $heightGT: Int = null,
      $heightLT: Int = null,
      $orderHeight: order_by = desc
    
    ) {
      ${this.envDB} {
        transaction(
          where: {
            event_attribute_index: {
              composite_key: {_eq: $compositeKey}, 
              value: {_eq: $address}}, 
            timestamp: {_lte: $endTime, _gte: $startTime}
            transaction_messages: {type: {_in: $listTxMsgType}}
            _and: [{height: {_gt: $heightGT, _lt: $heightLT}}]
          },
          limit: $limit,
          order_by: {height: $orderHeight}
        ) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: payload.limit || 40,
          compositeKey: payload.compositeKey,
          address: payload.address,
          heightLT: payload.heightLT,
          listTxMsgType: payload.listTxMsgType
        },
        operationName: 'QueryTxOfAccount',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListFTByAddress(payload) {
    const operationsDoc = `
    query Cw20TXOfAccount($receiver: String = null, $sender: String = null, $startTime: timestamptz = null, $endTime: timestamptz = null, $listAction: [String!] = null) {
      ${this.envDB} {
        transaction(where: {events: {smart_contract_events: {cw20_activities: {to: {_eq: $receiver}, _or: [{from: {_eq: $sender}}, {sender: {_eq: $sender}}], action: {_in: $listAction}}}}, timestamp: {_gte: $startTime, _lte: $endTime}}, order_by: {height: desc}) {
          gas_used
          hash
          height
          timestamp
          events(where: {smart_contract_events: {cw20_activities: {id: {_is_null: false}}}}) {
            smart_contract_events {
              cw20_activities {
                amount
                action
                from
                to
                sender
              }
              smart_contract {
                cw20_contract {
                  symbol
                  decimal
                }
              }
            }
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          sender: 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
          receiver: 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
          listAction: ['transfer'],
          startTime: '2023-01-13T11:11:46.644+07:00',
          endTime: '2023-01-13T11:11:46.644+07:00',
        },
        operationName: 'Cw20TXOfAccount',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTypeFilter() {
    const operationsDoc = `
    query GetListType {
      ${this.envDB} {
        transaction_message(distinct_on: type) {
          type
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {},
        operationName: 'GetListType',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
