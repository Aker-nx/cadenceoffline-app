const CACHE='cadence-v16';
const FILES=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  const fromCache=()=>caches.match(e.request,{ignoreSearch:true}).then(h=>h||caches.match('index.html'));
  // network first (so new versions always arrive), cache when offline or slow
  e.respondWith(new Promise(res=>{
    const t=setTimeout(()=>fromCache().then(h=>h&&res(h)),4000);
    fetch(e.request.mode==='navigate'?e.request.url:e.request,{cache:'no-cache'}).then(r=>{
      clearTimeout(t);
      if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}
      res(r);
    }).catch(()=>{clearTimeout(t);fromCache().then(h=>res(h||Response.error()))});
  }));
});
