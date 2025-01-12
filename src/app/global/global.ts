import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { TabsAccountLink } from '../core/constants/account.enum';
import { LENGTH_CHARACTER, NULL_ADDRESS, NUMBER_CONVERT, STORAGE_KEYS } from '../core/constants/common.constant';
import { TYPE_TRANSACTION } from '../core/constants/transaction.constant';
import {
  CodeTransaction,
  ModeExecuteTransaction,
  StatusTransaction,
  TRANSACTION_TYPE_ENUM,
  TypeTransaction,
} from '../core/constants/transaction.enum';
import { CommonDataDto } from '../core/models/common.model';
import { convertTxNative, getTypeTx } from '../core/utils/common/info-common';
import { balanceOf } from '../core/utils/common/parsing';
import local from '../core/utils/storage/local';

Injectable();

export class Globals {
  dataHeader = new CommonDataDto();
}

export function getAmount(arrayMsg, type, rawRog = '', coinMinimalDenom = '') {
  let amount = 0;
  let amountFormat;
  let eTransType = TRANSACTION_TYPE_ENUM;

  //check is ibc
  if (type.indexOf('ibc') > -1) {
    arrayMsg.forEach((element) => {
      if (element['@type'] != eTransType.IBCUpdateClient) {
        switch (element['@type']) {
          case eTransType.IBCReceived:
            amountFormat = 'More';
            break;
          case eTransType.IBCTransfer:
            amountFormat = balanceOf(element.token.amount);
            break;
          default:
            return amountFormat;
        }
      }
    });
    return amountFormat;
  }

  let itemMessage = arrayMsg[0];

  try {
    if (
      itemMessage?.amount &&
      (type === eTransType.Undelegate || type === eTransType.Delegate || type === eTransType.Redelegate)
    ) {
      amount = itemMessage?.amount.amount;
    } else if (itemMessage?.amount) {
      amount = itemMessage?.amount[0].amount;
    } else if (itemMessage?.funds && itemMessage?.funds.length > 0) {
      amount = itemMessage?.funds[0].amount;
    } else if (type === eTransType.SubmitProposalTx || type === eTransType.SubmitProposalTxV2) {
      amount =
        itemMessage?.initial_deposit[0]?.amount ||
        itemMessage?.content?.amount[0]?.amount ||
        itemMessage?.amount[0]?.amount ||
        0;
    } else if (type === eTransType.CreateValidator) {
      amount = itemMessage?.value?.amount || 0;
    } else if (type === eTransType.ExecuteAuthz) {
      itemMessage?.msgs.forEach((element) => {
        amount += +element?.amount?.amount;
      });
    }
  } catch {}

  if (itemMessage && amount >= 0) {
    amount = amount / NUMBER_CONVERT || 0;
    amountFormat = amount;
    if (
      ((type === TRANSACTION_TYPE_ENUM.GetReward || type === TRANSACTION_TYPE_ENUM.Undelegate) &&
        arrayMsg?.length > 1) ||
      type === TRANSACTION_TYPE_ENUM.MultiSend ||
      type === TRANSACTION_TYPE_ENUM.PeriodicVestingAccount
    ) {
      amountFormat = 'More';
    }
  }

  return amountFormat;
}

export function getDataInfo(arrayMsg, addressContract, rawLog = '') {
  let itemMessage = arrayMsg[0];
  let fromAddress = '',
    toAddress = '';
  let method = '';
  let value = 0;
  let tokenId = '';
  let modeExecute = ModeExecuteTransaction.Default;
  let eTransType = TRANSACTION_TYPE_ENUM;
  switch (itemMessage['@type']) {
    case eTransType.InstantiateContract:
      fromAddress = itemMessage.sender;
      toAddress =
        itemMessage.msg?.minter ||
        itemMessage.contract_address ||
        itemMessage.msg?.initial_balances[0]?.address ||
        itemMessage.msg?.mint?.minter;
      break;
    case eTransType.Delegate:
      fromAddress = itemMessage.delegator_address;
      toAddress = itemMessage.validator_address;
      break;
    case eTransType.GetReward:
      fromAddress = itemMessage.validator_address;
      toAddress = itemMessage.delegator_address;
      break;
    case eTransType.StoreCode:
      fromAddress = itemMessage.sender;
      toAddress = addressContract;
      break;
    case eTransType.ExecuteContract:
      method = 'mint';
      itemMessage.msg = itemMessage.msg || '';
      if (typeof itemMessage.msg === 'string') {
        try {
          itemMessage.msg = JSON.parse(itemMessage.msg);
        } catch (e) {}
      }

      if (itemMessage.msg) {
        method = Object.keys(itemMessage.msg)[0];
      }

      value = itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.amount || 0;
      toAddress =
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.recipient ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.owner ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.spender ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.to ||
        itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.operator;

      if (arrayMsg?.length > 1 || itemMessage.msg['batch_mint']) {
        tokenId = 'More';
      } else {
        tokenId = itemMessage.msg[Object.keys(itemMessage.msg)[0]]?.token_id || '';
      }

      if (!toAddress) {
        try {
          const json = JSON.parse(rawLog);
          const data = json[0]?.events[json[0]?.events?.length - 1]?.attributes;
          toAddress = data.find((k) => k.key === 'owner')?.value || null;
          tokenId = tokenId || data.find((k) => k.key === 'token_id')?.value || null;
        } catch (e) {}
      }
      fromAddress = itemMessage.sender;

      if (method === ModeExecuteTransaction.Burn) {
        toAddress = NULL_ADDRESS;
        modeExecute = ModeExecuteTransaction.Burn;
      } else if (method === ModeExecuteTransaction.Mint) {
        fromAddress = NULL_ADDRESS;
        modeExecute = ModeExecuteTransaction.Mint;
      } else if (method === ModeExecuteTransaction.Take) {
        fromAddress = NULL_ADDRESS;
        toAddress = itemMessage.sender;
        modeExecute = ModeExecuteTransaction.Take;
        try {
          const data = JSON.parse(rawLog);
          tokenId =
            data[0]?.events[data[0]?.events?.length - 1]?.attributes.find((k) => k.key === 'token_id')?.value || null;
        } catch (e) {}
      } else if (method === ModeExecuteTransaction.UnEquip) {
        toAddress = NULL_ADDRESS;
        modeExecute = ModeExecuteTransaction.UnEquip;
      } else if (method === ModeExecuteTransaction.AcceptOffer) {
        toAddress = itemMessage?.msg?.accept_nft_offer?.offerer;
      } else if (method === ModeExecuteTransaction.Buy) {
        fromAddress = null;
        toAddress = itemMessage.sender;
        try {
          const data = JSON.parse(rawLog);
          fromAddress =
            data[0]?.events[0]?.attributes.find(
              (k) => k.key === 'receiver' && k.value.length <= LENGTH_CHARACTER.ADDRESS,
            )?.value || null;
        } catch (e) {}
      } else if (method === ModeExecuteTransaction.Send) {
        toAddress = itemMessage?.msg?.send?.contract;
      }
      break;
    case eTransType.Deposit:
      fromAddress = itemMessage.depositor;
      toAddress = addressContract;
      break;
    case eTransType.SubmitProposalTx:
      fromAddress = itemMessage.proposer;
      toAddress = itemMessage?.content.recipient;
      break;
    case eTransType.Redelegate:
      fromAddress = itemMessage.delegator_address;
      toAddress = itemMessage.validator_dst_address;
      break;
    case eTransType.Undelegate:
      fromAddress = itemMessage.validator_address;
      toAddress = itemMessage.delegator_address;
      break;
    case eTransType.Vote:
      fromAddress = itemMessage.voter;
      toAddress = itemMessage.delegator_address;
      break;
    default:
      fromAddress = itemMessage.from_address;
      toAddress = itemMessage.to_address;
      break;
  }
  toAddress = toAddress || itemMessage?.contract;
  return [fromAddress, toAddress, value, method, tokenId, modeExecute];
}

export function convertDataTransaction(data, coinInfo) {
  const txs = _.get(data, 'transaction').map((element) => {
    if (!element['data']['body']) {
      element['data']['body'] = element['data']['tx']['body'];
      element['data']['auth_info'] = element['data']['tx']['auth_info'];
    }

    const code = _.get(element, 'code');
    const tx_hash = _.get(element, 'hash');
    const messages = _.get(element, 'data.body.messages');

    let _type = _.get(element, 'data.body.messages[0].@type');
    let lstType = _.get(element, 'data.body.messages');
    let denom = coinInfo.coinDenom;

    // check send token ibc same chain
    if (_type === TRANSACTION_TYPE_ENUM.Send && messages[0]?.amount[0]?.denom !== denom) {
      denom = messages[0].amount[0].denom;
    }

    // check transfer token ibc different chain
    if (_type === TRANSACTION_TYPE_ENUM.IBCTransfer && messages[0]?.token?.denom !== denom) {
      denom = messages[0].token?.denom;
    }

    if (lstType?.length > 1) {
      lstType.forEach((type) => {
        if (type['@type'] !== TRANSACTION_TYPE_ENUM.IBCUpdateClient && type['@type'].indexOf('ibc') > -1) {
          _type = type['@type'];
          try {
            let dataEncode = atob(type?.packet?.data);
            const data = JSON.parse(dataEncode);
            denom = data.denom;
          } catch (e) {
            denom = coinInfo.coinDenom;
          }
          return;
        }
      });
    }

    const _amount = getAmount(
      _.get(element, 'data.body.messages'),
      _type,
      _.get(element, 'data.body.raw_log'),
      coinInfo.coinMinimalDenom,
    );

    const typeOrigin = _type;
    let amount = _.isNumber(_amount) && _amount > 0 ? _amount.toFixed(coinInfo.coinDecimals) : _amount;
    let type = _.find(TYPE_TRANSACTION, { label: _type })?.value || _type.split('.').pop();
    if (type.startsWith('Msg')) {
      type = type?.replace('Msg', '');
    }

    try {
      if (lstType[0]['@type'].indexOf('ibc') == -1) {
        if (lstType[0]['@type'] === TRANSACTION_TYPE_ENUM.GetReward) {
          type = TypeTransaction.GetReward;
        } else if (lstType?.length > 1) {
          if (lstType[0]['@type'] === TRANSACTION_TYPE_ENUM.MultiSend) {
            type = TypeTransaction.MultiSend;
          } else {
            type = 'Multiple';
          }
          amount = 'More';
        }
      }
    } catch (e) {}

    if (typeOrigin === TRANSACTION_TYPE_ENUM.ExecuteContract) {
      try {
        let dataTemp = JSON.parse(messages[0]?.msg);
        let action = Object.keys(dataTemp)[0];
        type = 'Contract: ' + action;
      } catch {}
    }

    const status =
      _.get(element, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;

    const fee = balanceOf(_.get(element, 'data.auth_info.fee.amount[0].amount') || 0, coinInfo.coinDecimals).toFixed(
      coinInfo.coinDecimals,
    );
    const height = _.get(element, 'height');
    const timestamp = _.get(element, 'timestamp');
    const gas_used = _.get(element, 'gas_used');
    const gas_wanted = _.get(element, 'gas_wanted');
    const memo = _.get(element, 'memo');
    let tx = _.get(element, 'data.tx_response');
    if (tx) {
      tx['tx'] = _.get(element, 'data.tx');
    }

    return {
      code,
      tx_hash,
      type,
      status,
      amount,
      fee,
      height,
      timestamp,
      gas_used,
      gas_wanted,
      denom,
      messages,
      tx,
      typeOrigin,
      lstType,
      memo,
    };
  });
  return txs;
}

export function convertDataBlock(data) {
  const block = _.get(data, 'block').map((element) => {
    const height = _.get(element, 'height');
    const block_hash = _.get(element, 'hash');
    const num_txs = _.get(element, 'txs.length') || _.get(element, 'data.block.data.txs.length') || 0;
    const proposer = _.get(element, 'validator.description.moniker');
    const operator_address = _.get(element, 'validator.operator_address');
    const timestamp = _.get(element, 'time');
    return { height, block_hash, num_txs, proposer, operator_address, timestamp };
  });
  return block;
}

export function convertDataAccountTransaction(
  data,
  coinInfo,
  modeQuery,
  setReceive = false,
  currentAddress = null,
  coinConfig = null,
) {
  const txs = _.get(data, 'transaction').map((element) => {
    const code = _.get(element, 'code');
    const tx_hash = _.get(element, 'hash');

    const lstTypeTemp = _.get(element, 'transaction_messages');
    let type;
    if (lstTypeTemp) {
      if (lstTypeTemp[0]['type'] === TRANSACTION_TYPE_ENUM.GetReward) {
        type = TypeTransaction.GetReward;
      } else if (lstTypeTemp?.length > 1) {
        if (lstTypeTemp[0]['type'] === TRANSACTION_TYPE_ENUM.MultiSend) {
          type = TypeTransaction.MultiSend;
        } else {
          type = 'Multiple';
        }
      }
    }

    let denom = coinInfo.coinDenom;
    const _amount = _.get(element, 'events[0].event_attributes[2].value');
    let amount;
    if (_amount) {
      amount = balanceOf(_amount?.match(/\d+/g)[0]);
    }

    const status =
      _.get(element, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;

    const fee = balanceOf(_.get(element, 'fee[0].amount') || 0, coinInfo.coinDecimals).toFixed(coinInfo.coinDecimals);
    const height = _.get(element, 'height');
    const timestamp = _.get(element, 'timestamp');
    let limit = 5;
    let fromAddress;
    let toAddress;
    let arrEvent;
    let tokenId;
    let contractAddress;
    let action;
    let eventAttr;

    switch (modeQuery) {
      case TabsAccountLink.ExecutedTxs:
        type = getTypeTx(element)?.type;
        break;
      case TabsAccountLink.NativeTxs:
        let arrTemp = [];
        element?.coin_transfers?.forEach((data, i) => {
          toAddress = data.to;
          fromAddress = data.from;
          let { type, action } = getTypeTx(element);
          let amountString = data.amount + data.denom || denom;
          let decimal = coinInfo.coinDecimals;
          let amountTemp = data.amount;
          let denomOrigin;
          if (amountString?.indexOf('ibc') > -1) {
            const dataIBC = convertTxNative(amountString, coinInfo.coinDecimals);
            decimal = dataIBC['decimal'];
            amount = balanceOf(Number(data.amount) || 0, dataIBC['decimal'] || decimal);
            denomOrigin = dataIBC['denom'];
            denom = dataIBC['display']?.indexOf('ibc') === -1 ? 'ibc/' + dataIBC['display'] : dataIBC['display'];
          } else {
            amount = balanceOf(Number(data.amount) || 0, decimal);
            denom = coinInfo.coinDenom;
          }
          const result = { type, toAddress, fromAddress, amount, denom, amountTemp, action, decimal, denomOrigin };
          arrTemp.push(result);
        });
        arrEvent = arrTemp;
        break;
      case TabsAccountLink.FtsTxs:
        arrEvent = _.get(element, 'cw20_activities')?.map((item, index) => {
          let { type, action } = getTypeTx(element);
          let fromAddress = _.get(item, 'from') || NULL_ADDRESS;
          let toAddress = _.get(item, 'to') || NULL_ADDRESS;
          let denom = _.get(item, 'cw20_contract.symbol');
          let amountTemp = _.get(item, 'amount');
          let decimal = _.get(item, 'cw20_contract.decimal');
          let amount = balanceOf(amountTemp || 0, +decimal);
          let contractAddress = _.get(item, 'cw20_contract.smart_contract.address');
          return { type, fromAddress, toAddress, amount, denom, contractAddress, action, amountTemp, decimal };
        });
        break;
      case TabsAccountLink.NftTxs:
        arrEvent = _.get(element, 'cw721_activities')?.map((item, index) => {
          let { type, action } = getTypeTx(element);
          let fromAddress = _.get(item, 'from') || NULL_ADDRESS;
          let toAddress = _.get(item, 'to') || _.get(item, 'cw721_contract.smart_contract.address') || NULL_ADDRESS;
          if (action === 'burn') {
            toAddress = NULL_ADDRESS;
          }

          let contractAddress = _.get(item, 'cw721_contract.smart_contract.address');
          let tokenId = _.get(item, 'cw721_token.token_id');
          let eventAttr = element.event_attribute_index;
          return { type, fromAddress, toAddress, tokenId, contractAddress, eventAttr };
        });
        break;
    }

    if (modeQuery !== TabsAccountLink.ExecutedTxs) {
      fromAddress = arrEvent[0]?.fromAddress;
      toAddress = arrEvent[0]?.toAddress;
      denom = arrEvent[0]?.denom;
      amount = arrEvent[0]?.amount;
      type = arrEvent[0]?.type || lstTypeTemp[0]?.type?.split('.').pop();
      if (type?.startsWith('Msg')) {
        type = type?.replace('Msg', '');
      }
      tokenId = arrEvent[0]?.tokenId;
      contractAddress = arrEvent[0]?.contractAddress;
      action = arrEvent[0]?.action;
      eventAttr = arrEvent[0]?.eventAttr;
    }

    if (type === 'Send' && setReceive) {
      type = 'Receive';
    }

    return {
      code,
      tx_hash,
      type,
      status,
      amount,
      fee,
      height,
      timestamp,
      denom,
      fromAddress,
      toAddress,
      tokenId,
      contractAddress,
      arrEvent,
      limit,
      action,
      eventAttr,
      lstTypeTemp,
    };
  });
  return txs;
}

export function convertDataTransactionSimple(data, coinInfo) {
  return _.get(data, 'transaction').map((element) => {
    const code = _.get(element, 'code');
    const tx_hash = _.get(element, 'hash');
    const txMessages = _.get(element, 'transaction_messages');
    const txBodyMsgType = _.get(element, 'data[0][@type]');

    let type = '';
    if (txMessages?.length > 0) {
      const msgType = _.get(txMessages, '[0].type');

      type = _.find(TYPE_TRANSACTION, { label: msgType })?.value || msgType?.split('.').pop();
      if (msgType === TRANSACTION_TYPE_ENUM.ExecuteContract) {
        try {
          let dataTemp = JSON.parse(txMessages[0]?.content?.msg);
          let action = Object.keys(dataTemp)[0];
          type = 'Contract: ' + action;
        } catch {}
      }

      if (type?.startsWith('Msg')) {
        type = type?.replace('Msg', '');
      }
    } else {
      type = txBodyMsgType?.split('.').pop();
    }

    const status =
      _.get(element, 'code') == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;

    const fee = balanceOf(_.get(element, 'fee[0].amount') || 0, coinInfo.coinDecimals).toFixed(coinInfo.coinDecimals);
    const height = _.get(element, 'height');
    const timestamp = _.get(element, 'timestamp');
    let tx = _.get(element, 'data.tx_response');
    if (tx) {
      tx['tx'] = _.get(element, 'data.tx');
    }

    return {
      code,
      tx_hash,
      type,
      status,
      fee,
      height,
      timestamp,
      tx,
      lstType: txMessages,
    };
  });
}

export function clearLocalData() {
  local.removeItem(STORAGE_KEYS.USER_DATA);
  local.removeItem(STORAGE_KEYS.LIST_NAME_TAG);
  local.removeItem(STORAGE_KEYS.LIST_WATCH_LIST);
  local.removeItem(STORAGE_KEYS.REGISTER_FCM);
}

export function convertTxIBC(data, coinInfo) {
  const txs = _.get(data, 'ibc_ics20').map((data) => {
    let element = data.ibc_message?.transaction;
    const code = _.get(element, 'code');
    const lstTypeTemp = _.get(element, 'transaction_messages');
    const status = code == CodeTransaction.Success ? StatusTransaction.Success : StatusTransaction.Fail;
    let amountTemp = _.get(data, 'amount');
    let amount = balanceOf(amountTemp || 0, coinInfo.coinDecimals);

    return {
      code,
      tx_hash: _.get(element, 'hash'),
      type: getTypeTx(element)?.type,
      status,
      from_address: _.get(data, 'sender'),
      to_address: _.get(data, 'receiver'),
      fee: balanceOf(_.get(element, 'fee[0].amount') || 0, coinInfo.coinDecimals).toFixed(coinInfo.coinDecimals),
      height: _.get(element, 'height'),
      timestamp: _.get(element, 'timestamp'),
      amount,
      amountTemp,
      denom: _.get(data, 'denom'),
      lstTypeTemp,
    };
  });
  return txs;
}
