import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChainInfo } from '@keplr-wallet/types';
import * as _ from 'lodash';
import { BehaviorSubject, lastValueFrom } from 'rxjs';

export interface IConfiguration {
  environment: {
    name: string;
    label: {
      desktop: string;
      mobile: string;
    };
    logo: string;
    notice: {
      content: string;
      url: string;
    };
  };
  chainConfig: {
    stakingTime: string;
    blockTime: number;
    quotaSetPrivateName: number;
    quotaSetWatchList: number;
    quotaNotification: number;
    coins: {
      name: string;
      display: string;
      denom: string;
      decimal: number;
      logo: string;
    }[];
    features: string[];
    chain_info: ChainInfo & { gasPriceStep: any };
  };
  image: {
    validator: string;
    assets: string;
  };
  api: {
    backend: string;
    socket: string;
    ipfsDomain: string;
    googleClientId: string;
    google: {
      url: string;
      clientId: string;
      siteKeyCaptcha: string;
    };
    horoscope: {
      url: string;
      graphql: string;
      rest: string;
      chain: string;
    };
  };
}

@Injectable()
export class EnvironmentService {
  configUri = './assets/config/config.json';
  private config: BehaviorSubject<IConfiguration> = new BehaviorSubject(null);

  get configValue(): IConfiguration {
    return this.config?.value;
  }

  get environment() {
    return _.get(this.configValue, 'environment');
  }

  get chainConfig() {
    return _.get(this.configValue, 'chainConfig');
  }

  get chainInfo() {
    return _.get(this.configValue, 'chainConfig.chain_info');
  }

  get chainId() {
    return _.get(this.configValue, 'chainConfig.chain_info.chainId');
  }

  get stakingTime() {
    return _.get(this.configValue, 'chainConfig.stakingTime');
  }

  get coins() {
    return _.get(this.configValue, 'chainConfig.coins');
  }

  get imageUrl() {
    return _.get(this.configValue, 'image.assets');
  }

  get ipfsDomain() {
    return _.get(this.configValue, 'api.ipfsDomain');
  }

  get backend() {
    return _.get(this.configValue, 'api.backend');
  }

  get horoscope() {
    return _.get(this.configValue, 'api.horoscope');
  }

  get socketUrl() {
    return _.get(this.configValue, 'api.socket');
  }

  get googleClientId() {
    const _google = _.get(this.configValue, 'api.google');
    return `${_google.clientId}.${_google.url}`;
  }

  get siteKeyCaptcha() {
    return _.get(this.configValue, 'api.google.siteKeyCaptcha');
  }
  constructor(private http: HttpClient) {}

  loadConfig() {
    return this.http.get<IConfiguration>(this.configUri);
  }

  async load(): Promise<void> {
    return lastValueFrom(this.loadConfig())
      .then((config: any) => {
        const configuration: IConfiguration = config as IConfiguration;

        if (this.config) {
          this.config.next(configuration);
          return;
        }

        this.config = new BehaviorSubject(configuration);
      })
      .catch((err: any) => {
        console.error(err);
      });
  }
}
