const saves = new Map();
export default {
 'storage.get': async ({key}) => ({value:saves.get(key)??null,version:saves.has(key)?1:0,source:'cloud'}),
 'storage.set': async ({key,value}) => {saves.set(key,value);return {ok:true,version:1,outcome:'written'};},
};
