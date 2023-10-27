import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EnvironmentService } from '../data-services/environment.service';
import { CommonService } from './common.service';
import { map } from 'rxjs/operators';
import { CW20_TRACKING, CW721_TRACKING } from '../constants/common.constant';

@Injectable()
export class UserService extends CommonService {
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
    this.apiUrl = this.apiUrl || this.environmentService.configValue.beUri;
    return this.http.post<any>(`${this.apiUrl}/auth/refresh-token`, payload);
  }

  getListTxByAddress(payload) {
    const operationsDoc = `
    query QueryTxOfAccount($startTime: timestamptz = null, $endTime: timestamptz = null, $limit: Int = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $orderHeight: order_by = desc, $address: String = null) {
      ${this.envDB} {
        transaction(where: {timestamp: {_lte: $endTime, _gte: $startTime}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}, sender: {_eq: $address}}, _and: [{height: {_gt: $heightGT, _lt: $heightLT}}]}, limit: $limit, order_by: {height: $orderHeight}) {
          hash
          height
          fee
          timestamp
          code
          transaction_messages {
            type
            content
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
          address: payload.address,
          heightLT: payload.heightLT,
          listTxMsgType: payload.listTxMsgType,
          listTxMsgTypeNotIn: payload.listTxMsgTypeNotIn,
          startTime: payload.startTime,
          endTime: payload.endTime,
        },
        operationName: 'QueryTxOfAccount',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  queryListTxId(payload) {
    const operationsDoc = `
    query getTxIds($heightLT: Int = null, $address: String = "", $txLT: Int = null) {
      ${this.envDB} {
        fetch_tx_ids_by_events(
          args: {
            composite_key_in: "{\\"transfer.sender\\",\\"transfer.recipient\\"}"
            value_eq: $address
            tx_id_lte: $txLT
            block_height_gte: $heightLT
          }
        ) {
          tx_id
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          txLT: payload.txLT,
          heightLT: payload.heightLT,
          address: payload.address
        },
        operationName: 'getTxIds',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  queryAuraTransferByTime(ids) {
    const operationsDoc = `
    query QueryAuraTransferByTime {
      ${this.envDB} {
        block(order_by: {height: desc}, where: 
          {time: {_lte / _gte: "2023-10-9"}}, limit: 1) {
          height
          time
        }
      }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          limit: 100,
          ids: ids,
        },
        operationName: 'QueryAuraTransferByTime',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListTxAuraByAddress(ids) {
    const operationsDoc = `
    query QueryTxMsgOfAccount($ids: [Int!]) {
      ${this.envDB} {
        transaction(where: {id: {_in: $ids}}){
          hash
          height
          fee
          timestamp
          code
          data
          transaction_messages {
            type
            content
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          ids: ids,
        },
        operationName: 'QueryTxMsgOfAccount',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListFTByAddress(payload) {
    const operationsDoc = `
    query Cw20TXMultilCondition($receiver: String = null, $sender: String = null, $contractAddr: String = null, $startTime: timestamptz = null, $endTime: timestamptz = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = null, $txHash: String = null, $actionIn: [String!] = null, $actionNotIn: [String!] = null) {
      ${this.envDB} {
        transaction(where: {events: {smart_contract_events: {cw20_activities: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], action: {_in: $actionIn, _nin: $actionNotIn}}, smart_contract: {address: {_eq: $contractAddr}}}}, timestamp: {_gte: $startTime, _lte: $endTime}, _and: {height: {_gt: $heightGT, _lt: $heightLT}, hash: {_eq: $txHash}}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}}}, order_by: {height: desc}, limit: $limit) {
          gas_used
          hash
          height
          timestamp
          code
          transaction_messages {
            content
            type
          }
          events(where: {smart_contract_events: {cw20_activities: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], id: {_is_null: false}}}}) {
            smart_contract_events {
              cw20_activities {
                amount
                action
                from
                to
                sender
              }
              smart_contract {
                address
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
          sender: payload.sender,
          receiver: payload.receiver,
          listTxMsgType: payload.listTxMsgType,
          startTime: payload.startTime,
          endTime: payload.endTime,
          contractAddr: payload.contractAddr,
          heightLT: payload.heightLT,
          txHash: payload.txHash,
          actionIn: CW20_TRACKING,
          actionNotIn: null,
        },
        operationName: 'Cw20TXMultilCondition',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }

  getListNFTByAddress(payload) {
    const operationsDoc = `
    query Cw721TXMultilCondition($receiver: String = null, $sender: String = null, $startTime: timestamptz = null, $endTime: timestamptz = null, $listTxMsgType: [String!] = null, $listTxMsgTypeNotIn: [String!] = null, $heightGT: Int = null, $heightLT: Int = null, $limit: Int = null, $contractAddr: String = null, $tokenId: String = null, $txHash: String = null, $neqCw4973: String, $eqCw4973: String = null, $actionIn: [String!] = null, $actionNotIn: [String!] = null) {
      ${this.envDB} {
        transaction(where: {events: {smart_contract_events: {cw721_activity: {_or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], cw721_token: {token_id: {_eq: $tokenId}}, action: {_in: $actionIn, _nin: $actionNotIn}}, smart_contract: {name: {_neq: $neqCw4973, _eq: $eqCw4973}, address: {_eq: $contractAddr}}}}, timestamp: {_gte: $startTime, _lte: $endTime}, _and: {height: {_gt: $heightGT, _lt: $heightLT}, hash: {_eq: $txHash}}, transaction_messages: {type: {_in: $listTxMsgType, _nin: $listTxMsgTypeNotIn}}}, order_by: {height: desc}, limit: $limit) {
          gas_used
          hash
          height
          timestamp
          code
          transaction_messages {
            content
            type
          }
          events(where: {smart_contract_events: {cw721_activity: {id: {_is_null: false}, _or: [{to: {_eq: $receiver}}, {from: {_eq: $sender}}], cw721_token: {token_id: {_eq: $tokenId}}}}}) {
            smart_contract_events {
              cw721_activity {
                action
                from
                to
                sender
                cw721_token {
                  token_id
                }
                cw721_contract {
                  smart_contract {
                    address
                  }
                }
              }
            }
          }
          event_attribute_index(where: {composite_key: {_eq: "wasm.spender"}}) {
            composite_key
            key
            value
          }
        }
      }
    }
    `;
    return this.http
      .post<any>(this.graphUrl, {
        query: operationsDoc,
        variables: {
          sender: payload.sender,
          receiver: payload.receiver,
          listTxMsgType: payload.listTxMsgType,
          startTime: payload.startTime,
          endTime: payload.endTime,
          contractAddr: payload.contractAddr,
          heightLT: payload.heightLT,
          txHash: payload.txHash,
          tokenId: payload.tokenId,
          actionIn: payload.isNFTDetail ? null : !payload.isTransferTab ? CW721_TRACKING : null,
          actionNotIn: payload.isNFTDetail ? null : payload.isTransferTab ? ['approve', 'instantiate', 'revoke'] : null,
          neqCw4973: payload.isCW4973 ? null : 'crates.io:cw4973',
          eqCw4973: payload.isCW4973 ? 'crates.io:cw4973' : null,
        },
        operationName: 'Cw721TXMultilCondition',
      })
      .pipe(map((res) => (res?.data ? res?.data[this.envDB] : null)));
  }
}
