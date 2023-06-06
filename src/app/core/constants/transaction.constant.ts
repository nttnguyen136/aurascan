import { TRANSACTION_TYPE_ENUM, TypeTransaction } from './transaction.enum';

export const TYPE_TRANSACTION = [
  { label: TRANSACTION_TYPE_ENUM.IBCTransfer, value: TypeTransaction.IBCTransfer },
  { label: TRANSACTION_TYPE_ENUM.IBCReceived, value: TypeTransaction.IBCReceived },
  { label: TRANSACTION_TYPE_ENUM.IBCAcknowledgement, value: TypeTransaction.IBCAcknowledgement },
  { label: TRANSACTION_TYPE_ENUM.IBCUpdateClient, value: TypeTransaction.IBCUpdateClient },
  { label: TRANSACTION_TYPE_ENUM.IBCTimeout, value: TypeTransaction.IBCTimeout },
  { label: TRANSACTION_TYPE_ENUM.IBCChannelOpenInit, value: TypeTransaction.IBCChannelOpenInit },
  { label: TRANSACTION_TYPE_ENUM.IBCConnectionOpenInit, value: TypeTransaction.IBCConnectionOpenInit },
  { label: TRANSACTION_TYPE_ENUM.IBCCreateClient, value: TypeTransaction.IBCCreateClient },
  { label: TRANSACTION_TYPE_ENUM.IBCChannelOpenAck, value: TypeTransaction.IBCChannelOpenAck },
  { label: TRANSACTION_TYPE_ENUM.IBCMsgConnectionOpenTry, value: TypeTransaction.IBCMsgConnectionOpenTry },
  { label: TRANSACTION_TYPE_ENUM.Send, value: TypeTransaction.Send },
  { label: TRANSACTION_TYPE_ENUM.MultiSend, value: TypeTransaction.MultiSend },
  { label: TRANSACTION_TYPE_ENUM.Delegate, value: TypeTransaction.Delegate },
  { label: TRANSACTION_TYPE_ENUM.Undelegate, value: TypeTransaction.Undelegate },
  { label: TRANSACTION_TYPE_ENUM.Redelegate, value: TypeTransaction.Redelegate },
  { label: TRANSACTION_TYPE_ENUM.GetReward, value: TypeTransaction.GetReward },
  { label: TRANSACTION_TYPE_ENUM.SwapWithinBatch, value: TypeTransaction.SwapWithinBatch },
  { label: TRANSACTION_TYPE_ENUM.DepositWithinBatch, value: TypeTransaction.DepositWithinBatch },
  { label: TRANSACTION_TYPE_ENUM.EditValidator, value: TypeTransaction.EditValidator },
  { label: TRANSACTION_TYPE_ENUM.CreateValidator, value: TypeTransaction.CreateValidator },
  { label: TRANSACTION_TYPE_ENUM.Unjail, value: TypeTransaction.Unjail },
  { label: TRANSACTION_TYPE_ENUM.StoreCode, value: TypeTransaction.StoreCode },
  { label: TRANSACTION_TYPE_ENUM.InstantiateContract, value: TypeTransaction.InstantiateContract },
  { label: TRANSACTION_TYPE_ENUM.InstantiateContract2, value: TypeTransaction.InstantiateContract },
  { label: TRANSACTION_TYPE_ENUM.ExecuteContract, value: TypeTransaction.ExecuteContract },
  { label: TRANSACTION_TYPE_ENUM.ModifyWithdrawAddress, value: TypeTransaction.ModifyWithdrawAddress },
  { label: TRANSACTION_TYPE_ENUM.JoinPool, value: TypeTransaction.JoinPool },
  { label: TRANSACTION_TYPE_ENUM.LockTokens, value: TypeTransaction.LockTokens },
  { label: TRANSACTION_TYPE_ENUM.JoinSwapExternAmountIn, value: TypeTransaction.JoinSwapExternAmountIn },
  { label: TRANSACTION_TYPE_ENUM.SwapExactAmountIn, value: TypeTransaction.SwapExactAmountIn },
  { label: TRANSACTION_TYPE_ENUM.BeginUnlocking, value: TypeTransaction.BeginUnlocking },
  { label: TRANSACTION_TYPE_ENUM.Vote, value: TypeTransaction.Vote },
  { label: TRANSACTION_TYPE_ENUM.Vesting, value: TypeTransaction.Vesting },
  { label: TRANSACTION_TYPE_ENUM.Deposit, value: TypeTransaction.Deposit },
  { label: TRANSACTION_TYPE_ENUM.SubmitProposalTx, value: TypeTransaction.SubmitProposalTx },
  { label: TRANSACTION_TYPE_ENUM.GetRewardCommission, value: TypeTransaction.GetRewardCommission },
  { label: TRANSACTION_TYPE_ENUM.PeriodicVestingAccount, value: TypeTransaction.PeriodicVestingAccount },
  { label: TRANSACTION_TYPE_ENUM.BasicAllowance, value: TypeTransaction.BasicAllowance },
  { label: TRANSACTION_TYPE_ENUM.PeriodicAllowance, value: TypeTransaction.PeriodicAllowance },
  { label: TRANSACTION_TYPE_ENUM.MsgGrantAllowance, value: TypeTransaction.MsgGrantAllowance },
  { label: TRANSACTION_TYPE_ENUM.MsgRevokeAllowance, value: TypeTransaction.MsgRevokeAllowance },
  { label: TRANSACTION_TYPE_ENUM.GrantAuthz, value: TypeTransaction.GrantAuthz },
  { label: TRANSACTION_TYPE_ENUM.ExecuteAuthz, value: TypeTransaction.ExecuteAuthz },
  { label: TRANSACTION_TYPE_ENUM.RevokeAuthz, value: TypeTransaction.RevokeAuthz },
  { label: TRANSACTION_TYPE_ENUM.MsgMigrateContract, value: TypeTransaction.MsgMigrateContract },
  { label: TRANSACTION_TYPE_ENUM.Fail, value: TypeTransaction.Fail },
];
