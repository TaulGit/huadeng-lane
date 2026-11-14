const saves = new Map();
export default {
 'exchange.listItems': async () => ({items:[{id:1,name:'街坊补给金',costAssetType:1,costAmount:0,adWatchCount:1,targetType:'lane_subsidy',targetAmount:120}]}),
 'exchange.create': async () => ({adOrderId:crypto.randomUUID(),remainWatchCount:1,targetWatchCount:1,providerPlacement:'{"mockWaitSeconds":1}',targetType:'lane_subsidy',targetAmount:120}),
 'exchange.showRewardedAd': async () => ({isEnded:true,count:1}),
 'exchange.confirm': async () => ({success:true}),
 'exchange.cancel': async () => ({ok:true}),
 'storage.get': async ({key}) => ({value:saves.get(key)??null,version:saves.has(key)?1:0,source:'cloud'}),
 'storage.set': async ({key,value}) => {saves.set(key,value);return {ok:true,version:1,outcome:'written'};},
};
