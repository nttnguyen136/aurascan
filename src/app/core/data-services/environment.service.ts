import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChainInfo } from '@keplr-wallet/types';
import { BehaviorSubject } from 'rxjs';
import { TRANSACTION_TYPE_ENUM, TypeTransaction } from '../constants/transaction.enum';
import { TYPE_TRANSACTION } from '../constants/transaction.constant';

export interface IConfiguration {
  fabric: string;
  beUri: string;
  chainId: string;
  timeStaking: string;
  urlSocket: string;
  image_s3: string;
  chain_info: ChainInfo | null;
  coins: any;
  timeInterval: number;
  ipfsDomain: string;
  evnLabel: any;
  maxValidator: number;
  horoscopeSelectedChain: string;
  horoscopeUrl: string;
  horoscopePathGraphql: string;
  horoscopePathApi: string;
  notice: { content: string; url: string };
  googleClientId: string;
  quotaSetPrivateName: number;
  features: string[];
}

@Injectable()
export class EnvironmentService {
  private config: BehaviorSubject<IConfiguration> = new BehaviorSubject({
    fabric: '',
    beUri: '',
    chainId: '',
    timeStaking: '',
    urlSocket: '',
    image_s3: '',
    chain_info: null,
    coins: '',
    timeInterval: null,
    ipfsDomain: '',
    evnLabel: '',
    maxValidator: null,
    horoscopeSelectedChain: '',
    horoscopeUrl: '',
    horoscopePathGraphql: '',
    horoscopePathApi: '',
    notice: { content: '', url: '' },
    googleClientId: '',
    quotaSetPrivateName: null,
    features: [],
  });

  get configValue(): IConfiguration {
    return this.config.value;
  }

  constructor(private http: HttpClient) {}

  loadConfig() {
    return this.http
      .get('./assets/config/config.json')
      .toPromise()
      .then((config: any) => {
        const chain_info = config['chain_info'];
        const chainId = chain_info.chainId;

        const data: IConfiguration = {
          fabric: config['fabric'],
          beUri: config['beUri'],
          chainId,
          timeStaking: config['timeStaking'] || '1814400',
          urlSocket: config['urlSocket'],
          image_s3: config['image_s3'] || './assets/',
          chain_info,
          coins: config['coins'],
          timeInterval: config['blockTime'] || 4000,
          ipfsDomain: config['ipfsDomain'],
          evnLabel: config['evnLabel'],
          maxValidator: config['maxValidator'] || 200,
          horoscopeSelectedChain: config['horoscopeSelectedChain'],
          horoscopeUrl: config['horoscopeUrl'],
          horoscopePathGraphql: config['horoscopePathGraphql'],
          horoscopePathApi: config['horoscopePathApi'],
          notice: config['notice'] || { content: '', url: '' },
          googleClientId:
            config['googleClientId'] || '3465782004-hp7u6vlitgs109rl0emrsf1oc7bjvu08.apps.googleusercontent.com',
          quotaSetPrivateName: config['quotaSetPrivateName'] || 10,
          features: config['features'],
        };

        this.config.next(data);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }

  async load(): Promise<void> {
    await this.extendsTxType();
    await this.loadConfig();
  }

  extendsTxType(): Promise<void> {
    return this.http
      .get('./assets/config/tx_type_config.json')
      .toPromise()
      .then((typeConfigs) => {
        (typeConfigs as any[]).forEach((data) => {
          TRANSACTION_TYPE_ENUM[data.label] = data.label;
          TypeTransaction[data.value] = data.value;
          TYPE_TRANSACTION.push({ label: TRANSACTION_TYPE_ENUM[data.label], value: TypeTransaction[data.value] });
        });
      });
  }
}
