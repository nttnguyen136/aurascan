import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { calculateFee, DeliverTxResponse, SigningStargateClient, StdFee } from '@cosmjs/stargate';
import { ChainInfo } from '@keplr-wallet/types';
import {KEPLR_ERRORS} from '../../constants/wallet.constant';
import { messageCreators } from './messages';
import { getSigner } from './signer';
import local from "src/app/core/utils/storage/local";
import { STORAGE_KEYS } from '../../constants/common.constant';

export async function createSignBroadcast(
  {
    messageType,
    message,
    senderAddress,
    network,
    signingType,
    chainId,
  }: { messageType: any; message: any; senderAddress: any; network: ChainInfo; signingType: any; chainId: any },
  validatorsCount?: number,
  coin98Client?: any,
): Promise<any> {
  let error: KEPLR_ERRORS;
  let broadcastResult: DeliverTxResponse;
  if (signingType === 'extension') {
  } else {
    // success
    const messagesSend = messageCreators[messageType](senderAddress, message, network);
    let fee;
    let client;

    if (coin98Client) {
      client = coin98Client;
      fee = client.getGasEstimateMobile(network, messageType, validatorsCount);
    } else {
      const signer = await getSigner(signingType, chainId);

      client = await SigningStargateClient.connectWithSigner(network.rpc, signer);
      fee = await getNetworkFee(network, senderAddress, messagesSend, '');
    }

    try {
      broadcastResult = await client.signAndBroadcast(
        senderAddress,
        Array.isArray(messagesSend) ? messagesSend : [messagesSend],
        fee,
      );

      assertIsBroadcastTxSuccess(broadcastResult);
    } catch (e: any) {
      error = e.message;
    }

    return {
      hash: broadcastResult?.transactionHash || null,
      error,
    };
  }
}

export async function getNetworkFee(network, address, messageType, memo = ''): Promise<StdFee> {
  //set default for multi gas
  let multiGas = 1.6;

  let gasEstimation = 0;
  try {
    const user: any = local.getItem(STORAGE_KEYS.LAST_USED_PROVIDER);
    if(!user?.provider) return null;
    let provider;
    switch(user.provider) {
      case 'KEPLR' :
        provider =  'Keplr';
        break;
      case 'COIN98' :
        provider =  'Coin98';
        break;
      case 'LEAP' :
        provider =  'Leap';
        break;
    }
    const signer = await getSigner(provider, network.chainId);
    const onlineClient = await SigningCosmWasmClient.connectWithSigner(network.rpc, signer);
    gasEstimation = await onlineClient.simulate(address, Array.isArray(messageType) ? messageType : [messageType], '');
  } catch (e) {
    gasEstimation = 100000;
  }
  let gasPrice = network.gasPriceStep.average.toString() + network.currencies[0].coinMinimalDenom;
  let calGasPrice = calculateFee(Math.round(gasEstimation * multiGas), gasPrice);

  return {
    amount: [
      {
        denom: network.currencies[0].coinMinimalDenom,
        amount: (calGasPrice?.amount[0]?.amount || network.gasPriceStep.average)?.toString(),
      },
    ],
    gas: Math.round(gasEstimation * multiGas).toString(),
  };
}

export function assertIsBroadcastTxSuccess(res): DeliverTxResponse {
  if (!res) throw new Error(`Error sending transaction`);
  if (Array.isArray(res)) {
    if (res.length === 0) throw new Error(`Error sending transaction`);

    res.forEach(assertIsBroadcastTxSuccess);
  }

  if (res.error) {
    throw new Error(res.error);
  }

  // Sometimes we get back failed transactions, which shows only by them having a `code` property
  if (res.code) {
    const message = res.raw_log?.message ? JSON.parse(res.raw_log).message : res.raw_log;
    throw new Error(message);
  }

  if (!res.transactionHash) {
    const message = res.message;
    throw new Error(message);
  }

  return res;
}
