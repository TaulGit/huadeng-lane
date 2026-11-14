export const subsidyType = 'lane_subsidy';
export const subsidyAmount = 120;

export async function claimSubsidy(sdk, state, persist) {
  if (state.subsidyDay === state.day) throw new Error('今天的补给已领取');
  const { items } = await sdk.exchange.listItems();
  const item = items.find(item => item.targetType === subsidyType &&
    item.targetAmount === subsidyAmount && item.adWatchCount === 1);
  if (!item) throw new Error('当前渠道暂未开放广告补给');

  await sdk.exchange.exchange({
    exchangeItemId: item.id,
    via: 'ad',
    async deliver(order) {
      const id = String(order.adOrderId ?? order.bizId ?? '');
      if (!id || order.targetType !== subsidyType || order.targetAmount !== subsidyAmount)
        throw new Error('补给订单与奖励不符');
      if (state.subsidyReceipts?.includes(id)) return;
      const next = { ...state, cash: state.cash + subsidyAmount, subsidyDay: state.day,
        subsidyReceipts: [...(state.subsidyReceipts ?? []), id] };
      await persist(next);
      Object.assign(state, next);
    }
  });
}
