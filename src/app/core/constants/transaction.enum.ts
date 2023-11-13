export enum TypeTransaction {
  IBCTransfer = 'IBC Transfer',
  IBCReceived = 'IBC Received',
  IBCAcknowledgement = 'IBC Acknowledgement',
  IBCUpdateClient = 'IBC Update Client',
  IBCTimeout = 'IBC Timeout',
  IBCChannelOpenInit = 'IBC Channel Open Init',
  IBCConnectionOpenInit = 'IBC Connect Open Init',
  IBCCreateClient = 'IBC Create Client',
  IBCChannelOpenAck = 'IBC Channel Open Ack',
  IBCMsgConnectionOpenTry = 'Connection Open Try',
  Send = 'Send',
  Received = 'Receive',
  MultiSend = 'Multisend',
  Delegate = 'Delegate',
  Undelegate = 'Undelegate',
  Redelegate = 'Redelegate',
  GetReward = 'Get Reward',
  SwapWithinBatch = 'Swap Within Batch',
  DepositWithinBatch = 'Deposit Within Batch',
  EditValidator = 'Edit Validator',
  CreateValidator = 'Create Validator',
  Unjail = 'Unjail',
  StoreCode = 'Store Code',
  InstantiateContract = 'Instantiate Contract',
  ExecuteContract = 'Execute Contract',
  ModifyWithdrawAddress = 'Set Withdraw Address',
  JoinPool = 'Join pool',
  LockTokens = 'Lock Tokens (Start Farming)',
  JoinSwapExternAmountIn = 'Join Swap Extern Amount In',
  SwapExactAmountIn = 'Swap Exact Amount In',
  BeginUnlocking = 'Begin Unlocking',
  Vote = 'Vote',
  Vesting = 'Vesting',
  Deposit = 'Deposit',
  SubmitProposalTx = 'Submit Proposal',
  GetRewardCommission = 'Withdraw Validator Commission',
  PeriodicVestingAccount = 'Periodic Vesting',
  BasicAllowance = 'Basic',
  PeriodicAllowance = 'Periodic',
  MsgGrantAllowance = 'Grant Allowance',
  MsgRevokeAllowance = 'Revoke Allowance',
  GrantAuthz = 'Grant Authz',
  ExecuteAuthz = 'Execute Authz',
  RevokeAuthz = 'Revoke Authz',
  MsgMigrateContract = 'Migrate Contract',
  Fail = 'Fail',
}

export enum TRANSACTION_TYPE_ENUM {
  IBCTransfer = '/ibc.applications.transfer.v1.MsgTransfer',
  IBCReceived = '/ibc.core.channel.v1.MsgRecvPacket',
  IBCAcknowledgement = '/ibc.core.channel.v1.MsgAcknowledgement',
  IBCUpdateClient = '/ibc.core.client.v1.MsgUpdateClient',
  IBCTimeout = '/ibc.core.channel.v1.MsgTimeout',
  IBCChannelOpenInit = '/ibc.core.channel.v1.MsgChannelOpenInit',
  IBCConnectionOpenInit = '/ibc.core.connection.v1.MsgConnectionOpenInit',
  IBCCreateClient = '/ibc.core.client.v1.MsgCreateClient',
  IBCChannelOpenAck = '/ibc.core.channel.v1.MsgChannelOpenAck',
  IBCMsgConnectionOpenTry = '/ibc.core.connection.v1.MsgConnectionOpenTry',
  Send = '/cosmos.bank.v1beta1.MsgSend',
  MultiSend = '/cosmos.bank.v1beta1.MsgMultiSend',
  Delegate = '/cosmos.staking.v1beta1.MsgDelegate',
  Undelegate = '/cosmos.staking.v1beta1.MsgUndelegate',
  Redelegate = '/cosmos.staking.v1beta1.MsgBeginRedelegate',
  GetReward = '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
  SwapWithinBatch = '/tendermint.liquidity.v1beta1.MsgSwapWithinBatch',
  DepositWithinBatch = '/tendermint.liquidity.v1beta1.MsgDepositWithinBatch',
  EditValidator = '/cosmos.staking.v1beta1.MsgEditValidator',
  CreateValidator = '/cosmos.staking.v1beta1.MsgCreateValidator',
  Unjail = '/cosmos.slashing.v1beta1.MsgUnjail',
  StoreCode = '/cosmwasm.wasm.v1.MsgStoreCode',
  InstantiateContract = '/cosmwasm.wasm.v1.MsgInstantiateContract',
  InstantiateContract2 = '/cosmwasm.wasm.v1.MsgInstantiateContract2',
  ExecuteContract = '/cosmwasm.wasm.v1.MsgExecuteContract',
  ModifyWithdrawAddress = '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress',
  JoinPool = '/osmosis.gamm.v1beta1.MsgJoinPool',
  LockTokens = '/osmosis.lockup.MsgLockTokens',
  JoinSwapExternAmountIn = '/osmosis.gamm.v1beta1.MsgJoinSwapExternAmountIn',
  SwapExactAmountIn = '/osmosis.gamm.v1beta1.MsgSwapExactAmountIn',
  BeginUnlocking = '/osmosis.lockup.MsgBeginUnlocking',
  Vote = '/cosmos.gov.v1beta1.MsgVote',
  VoteV2 = '/cosmos.gov.v1.MsgVote',
  Vesting = '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
  Deposit = '/cosmos.gov.v1beta1.MsgDeposit',
  DepositV2 = '/cosmos.gov.v1.MsgDeposit',
  SubmitProposalTx = '/cosmos.gov.v1beta1.MsgSubmitProposal',
  SubmitProposalTxV2 = '/cosmos.gov.v1.MsgSubmitProposal',
  GetRewardCommission = '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission',
  PeriodicVestingAccount = '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount',
  BasicAllowance = '/cosmos.feegrant.v1beta1.BasicAllowance',
  PeriodicAllowance = '/cosmos.feegrant.v1beta1.PeriodicAllowance',
  MsgGrantAllowance = '/cosmos.feegrant.v1beta1.MsgGrantAllowance',
  MsgRevokeAllowance = '/cosmos.feegrant.v1beta1.MsgRevokeAllowance',
  AllowedMsgAllowance = '/cosmos.feegrant.v1beta1.AllowedMsgAllowance',
  AllowedContractAllowance = '/cosmos.feegrant.v1beta1.AllowedContractAllowance',
  GrantAuthz = '/cosmos.authz.v1beta1.MsgGrant',
  ExecuteAuthz = '/cosmos.authz.v1beta1.MsgExec',
  RevokeAuthz = '/cosmos.authz.v1beta1.MsgRevoke',
  MsgMigrateContract = '/cosmwasm.wasm.v1.MsgMigrateContract',
  Fail = 'FAILED',
}

export enum StatusTransaction {
  Success = 'Success',
  Fail = 'Fail',
}

export enum CodeTransaction {
  Success = 0,
}

export enum ModeExecuteTransaction {
  Default = 'default',
  Mint = 'mint',
  Burn = 'burn',
  Buy = 'buy',
  Take = 'take',
  UnEquip = 'unequip',
  AcceptOffer = 'accept_nft_offer',
  Send = 'send',
  ProvideLiquidity = 'provide_liquidity',
  Approve = 'approve',
  Revoke = 'revoke'
}

export enum pipeTypeData {
  Number = 'Number',
  BalanceOf = 'BalanceOf',
  Json = 'Json',
  Percent = 'Percent',
}

export const LIST_TRANSACTION_FILTER = [
  { type: '/auranw.aura.smartaccount.MsgActivateAccount' },
  { type: '/cosmos.bank.v1beta1.MsgMultiSend' },
  { type: '/cosmos.bank.v1beta1.MsgSend' },
  { type: '/cosmos.distribution.v1beta1.MsgSetWithdrawAddress' },
  { type: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward' },
  { type: '/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission' },
  { type: '/cosmos.feegrant.v1beta1.MsgGrantAllowance' },
  { type: '/cosmos.feegrant.v1beta1.MsgRevokeAllowance' },
  { type: '/cosmos.gov.v1beta1.MsgDeposit' },
  { type: '/cosmos.gov.v1beta1.MsgSubmitProposal' },
  { type: '/cosmos.gov.v1beta1.MsgVote' },
  { type: '/cosmos.gov.v1.MsgDeposit' },
  { type: '/cosmos.gov.v1.MsgSubmitProposal' },
  { type: '/cosmos.gov.v1.MsgVote' },
  { type: '/cosmos.slashing.v1beta1.MsgUnjail' },
  { type: '/cosmos.staking.v1beta1.MsgBeginRedelegate' },
  { type: '/cosmos.staking.v1beta1.MsgCreateValidator' },
  { type: '/cosmos.staking.v1beta1.MsgDelegate' },
  { type: '/cosmos.staking.v1beta1.MsgEditValidator' },
  { type: '/cosmos.staking.v1beta1.MsgUndelegate' },
  { type: '/cosmos.vesting.v1beta1.MsgCreatePeriodicVestingAccount' },
  { type: '/cosmos.vesting.v1beta1.MsgCreateVestingAccount' },
  { type: '/cosmwasm.wasm.v1.MsgExecuteContract' },
  { type: '/cosmwasm.wasm.v1.MsgInstantiateContract' },
  { type: '/cosmwasm.wasm.v1.MsgMigrateContract' },
  { type: '/cosmwasm.wasm.v1.MsgStoreCode' },
  { type: '/ibc.applications.transfer.v1.MsgTransfer' },
  { type: '/ibc.core.channel.v1.MsgAcknowledgement' },
  { type: '/ibc.core.channel.v1.MsgChannelOpenAck' },
  { type: '/ibc.core.channel.v1.MsgChannelOpenConfirm' },
  { type: '/ibc.core.channel.v1.MsgChannelOpenInit' },
  { type: '/ibc.core.channel.v1.MsgChannelOpenTry' },
  { type: '/ibc.core.channel.v1.MsgRecvPacket' },
  { type: '/ibc.core.channel.v1.MsgTimeout' },
  { type: '/ibc.core.client.v1.MsgCreateClient' },
  { type: '/ibc.core.client.v1.MsgUpdateClient' },
  { type: '/ibc.core.connection.v1.MsgConnectionOpenAck' },
  { type: '/ibc.core.connection.v1.MsgConnectionOpenConfirm' },
  { type: '/ibc.core.connection.v1.MsgConnectionOpenInit' },
  { type: '/ibc.core.connection.v1.MsgConnectionOpenTry' },
];
