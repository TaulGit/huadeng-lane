import { setAdOpen } from './music.js';
import { claimSubsidy } from './subsidy.js';
import './style.css';import {playEffect} from './effects.js';import {TYPES,EVENTS,fresh,metrics,build,upgrade,settle,restore} from './sim.js';import {createWorld} from './world.js';
let state=fresh(),selected=1,running=false,sdk=null,world=null,ready=false;const $=s=>document.querySelector(s),money=n=>'¥'+Math.round(n).toLocaleString('zh-CN');function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');setTimeout(()=>$('#toast').classList.remove('show'),3500);}function modal(html){$('#modalbody').innerHTML=html;$('#modal').showModal();}$('#close').onclick=()=>$('#modal').close();
function render(){const supply=$('#supply');supply.disabled=!ready||running||!sdk||state.subsidyDay===state.day;supply.textContent=state.subsidyDay===state.day?'今日补给已领取':'看一次广告 · 领 120 资金';let m=metrics(state);$('#stats').innerHTML=`<span>资金 <b>${money(state.cash)}</b></span><span>满意度 <b>${state.happiness}%</b></span><span>居民 <b>${m.population}</b></span>`;$('#day').textContent=`第 ${state.day} 天 · ${running?'营业中':'清晨 06:00'}`;$('#event').innerHTML=`<b>${EVENTS[(state.day-1)%5].name}</b><br>${EVENTS[(state.day-1)%5].desc}`;$('#progress').value=Math.min(100,(Math.min(1,state.cash/5000)+Math.min(1,state.happiness/80)+Math.min(1,m.shops/4))/3*100);$('#goaltext').textContent=state.won?'已获街区新星！继续创造你的理想街道。':`商店 ${m.shops}/4 · ${state.day<=14?'距离评选还有 '+(15-state.day)+' 天':'评选已结束，可继续挑战'}`;$('#slots').innerHTML=state.slots.map((b,i)=>`<button data-slot="${i}" class="${i===selected?'selected':''}">${i+1}<small>${b?TYPES[b.type].name:'空地'}</small></button>`).join('');$('#slots').querySelectorAll('button').forEach(b=>b.onclick=()=>select(+b.dataset.slot));$('#start').disabled=running||!ready;$('#save').disabled=running||!ready;let b=state.slots[selected];$('#panel').innerHTML=b?`<h2>${TYPES[b.type].name} <small>Lv.${b.level}</small></h2><p>${TYPES[b.type].appeal?'主要客群：'+TYPES[b.type].appeal:TYPES[b.type].residents?'为街区增加 '+TYPES[b.type].residents+' 位居民':'满意度 +12'}</p>${b.price?`<label>售价 <b id="price">${money(b.price)}</b><input id="pricing" type="range" min="${Math.round(TYPES[b.type].price*.65)}" max="${Math.round(TYPES[b.type].price*1.8)}" value="${b.price}" ${running?'disabled':''}></label><small>价格越高，利润越厚，但客人会减少。</small>`:''}<button id="upgrade" ${running||b.level>=3?'disabled':''}>${b.level>=3?'已达到最高等级':'升级 · '+money(TYPES[b.type].cost*.65*b.level)}</button><button id="sell" ${running?'disabled':''}>拆除 · 回收 ${money(TYPES[b.type].cost*.5)}</button>`:`<h2>第 ${selected+1} 号空地</h2><p>选择一间店，点亮这条街。</p><div class="catalog">${Object.entries(TYPES).map(([id,t])=>`<button data-build="${id}" ${running||state.cash<t.cost?'disabled':''}><i style="background:${t.color}"></i><span>${t.name}<small>${t.appeal?'服务'+t.appeal:t.residents?'居民 +'+t.residents:'满意度 +12'}</small></span><b>${money(t.cost)}</b></button>`).join('')}</div>`;$('#panel').querySelectorAll('[data-build]').forEach(e=>e.onclick=()=>{if(ready&&!running&&build(state,selected,e.dataset.build)){render();playEffect('build',$('#panel'));save();toast('新店落成，街道又热闹了一点。');}});if(b){$('#upgrade').onclick=()=>{if(ready&&!running&&upgrade(state,selected)){render();playEffect('upgrade',$('#panel'));save();}else toast('资金不足，先营业积累收益。');};$('#sell').onclick=()=>{if(!ready||running)return;state.cash+=Math.round(TYPES[b.type].cost*.5);state.slots[selected]=null;render();save();};if(b.price)$('#pricing').onchange=e=>{if(!ready||running)return;b.price=+e.target.value;render();save();};}world?.sync(state,selected);}
function select(i){if(running||!ready)return;selected=i;render();}
function errorText(e){return window.GameSDK?.isPlatformSDKError?.(e)?`${e.code}：${e.message}`:e.message||String(e);}
let writes = Promise.resolve();
function persist(value) {
  const snapshot = structuredClone(value);
  const operation = writes.then(() => sdk.storage.set({key:'huadeng-save-v1', value:snapshot, saveMeta:{label:'花灯里 · 第'+snapshot.day+'天', gameVersion:'1.0.0'}}));
  writes = operation.catch(() => {});
  return operation;
}
async function save(){if(!sdk){$('#status').textContent='本次试玩 · 尚未连接云存档';return;}try{let r=await persist(state);$('#status').textContent=r.outcome==='pending'?'保存中…':'已保存';}catch(e){$('#status').textContent='保存失败，可点击重试';toast(errorText(e));}}
$('#save').onclick=save;$('#help').onclick=()=>modal('<h2>关于游戏</h2><p>在花灯里，一家拉面店就是你的起点。住宅带来街坊，庭园留住人气，书屋和温泉在不同日子各有生意。用十四天攒下 5,000 资金，让满意度达到 80，并经营至少四家商店，即可成为街区新星。评选结束后仍可继续经营。</p><h2>操作说明</h2><p>拖动街景旋转视角，滚轮或双指缩放。点空地选择建筑，点已建店铺可调价或升级。准备好后点「开始营业」，在日报中查看客流、成本和净利润。开店前可自愿完整观看一次广告，领取 120 资金，每个游戏日限一次。</p>');
$('#start').onclick=async()=>{if(running||!ready)return;running=true;render();world.animateCustomers(true);let ticks=0;$('#status').textContent='居民正在逛街…';let timer=setInterval(()=>{ticks++;$('#start').textContent=`营业中 ${Math.min(100,Math.round(ticks/12*100))}%`;if(ticks<12)return;clearInterval(timer);let r=settle(state);running=false;world.animateCustomers(false);$('#start').textContent='开始营业 →';render();save();modal(`<span class="eyebrow">第 ${r.day} 天 · 营业日报</span><h2>${r.profit>=0?'又是温暖的一天。':'明天换一种经营方式。'}</h2><div class="report"><span>营业额<b>${money(r.revenue)}</b></span><span>成本与维护<b>${money(r.expense)}</b></span><span>净利润<b>${money(r.profit)}</b></span></div><p>${r.visitors} 人次消费 · 满意度 ${state.happiness}%</p>${r.rows.map(x=>`<p>${x.name} <b>${x.count} 单 · ${money(x.income-x.costs)}</b></p>`).join('')}<p>${state.won?'✦ 恭喜获得街区新星！你可以继续经营。':state.day===15?'14 天评选结束。目标尚未全部达成，但街道会继续生长，继续经营吧。':'小建议：增加商店种类和庭园，比一味提高售价更能留住居民。'}</p>`);if(r.profit>0)playEffect('profit',$('#modalbody'));},1000);};
render();try{world=await createWorld($('#world'),select,(n,total)=>$('#loading').textContent=`正在布置街区 ${n}/${total}`);if(world.missing.length)throw Error('资产加载失败：'+world.missing.join('、'));$('#loading').hidden=true;render();}catch(e){$('#loading').textContent=errorText(e)+'，请刷新重试。';}
try{sdk=await window.GameSDK.init();let r=await sdk.storage.get({key:'huadeng-save-v1'});if(r.value)state=restore(r.value);else if(r.source==='local')throw Error('离线时尚无可用存档，请恢复网络后重试');$('#status').textContent='云存档已连接';render();}catch(e){sdk=null;toast('云存档未连接：'+errorText(e));$('#status').textContent='临时试玩 · 进度未保存';}finally{ready=!!world&&!world.missing.length;render();}

$('#supply').onclick = async () => {
  if (!ready || running || !sdk || state.subsidyDay === state.day) return;
  const app = $('#app');
  app.inert = true;
  setAdOpen(true);
  try {
    await claimSubsidy(sdk, state, async next => {
      const result = await persist(next);
      if (!result.ok || result.outcome === 'superseded') throw new Error('补给存档冲突，请刷新');
    });
    toast('街坊补给到账，资金 +120');
  } catch (error) {
    toast(error.code === 'AD_USER_CANCELLED' ? '已取消观看' : errorText(error));
  } finally {
    app.inert = false;
    setAdOpen(false);
    render();
  }
};
