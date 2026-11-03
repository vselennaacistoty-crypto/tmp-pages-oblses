/* ОблСЭС — app.js (редизайн 10.10.2026). Без внешних библиотек: контент и форма работают и без JS.
   Здесь: источник заявки, мобильное меню, видимые ошибки формы, цели Метрики, cookie-согласие.
   Cookie-модель повторяет рабочие баннеры окно-днр.рф и гриднев-обеды.рф: счётчик Яндекс.Метрики
   НЕ загружается, пока человек не разрешил аналитику; выбор хранится вместе с текстом, который он видел,
   и отметкой времени (доказательство факта и содержания согласия); ключ версионный — изменился текст,
   поднимаем версию, баннер спросит заново. Ссылка «Настройки cookie» в подвале открывает баннер снова. */
(function(){
  'use strict';
  var d=document, M=113373437;
  function goal(id){try{if(typeof window.ym==='function'){ym(M,'reachGoal',id);}}catch(e){}}

  /* 1. Антибот-таймштамп, страница и источник обращения (UTM/реферер запоминаем на первом входе) */
  function fill(){
    try{
      var t=Math.floor(Date.now()/1000), src='';
      try{
        var saved=sessionStorage.getItem('obl_src');
        if(!saved){
          var q=location.search, ref=d.referrer;
          saved=((/utm_|yclid|gclid|from=/.test(q)?q.slice(1):'')+(ref&&ref.indexOf(location.host)<0?' ref:'+ref.replace(/^https?:\/\//,'').slice(0,100):'')).trim()||'direct';
          sessionStorage.setItem('obl_src',saved); sessionStorage.setItem('obl_land',location.pathname);
        }
        src=saved+' | вход: '+(sessionStorage.getItem('obl_land')||location.pathname);
      }catch(e){}
      var set=function(cls,val){var n=d.querySelectorAll(cls);for(var i=0;i<n.length;i++){n[i].value=val;}};
      set('.zt',t); set('.zpage',location.pathname); set('.zsrc',src.slice(0,200));
    }catch(e){}
  }
  if(d.readyState==='loading'){d.addEventListener('DOMContentLoaded',fill);}else{fill();}

  /* 2. Мобильное меню: кнопка, крестик, Escape, клик по ссылке */
  var mm=d.getElementById('mmenu'), bg=d.getElementById('burger'), mx=d.getElementById('mx');
  function openMenu(){mm.hidden=false;d.documentElement.classList.add('menu-open');bg.setAttribute('aria-expanded','true');if(mx){mx.focus();}}
  function closeMenu(){mm.hidden=true;d.documentElement.classList.remove('menu-open');bg.setAttribute('aria-expanded','false');bg.focus();}
  if(mm&&bg){
    bg.addEventListener('click',openMenu);
    if(mx){mx.addEventListener('click',closeMenu);}
    mm.addEventListener('click',function(ev){var a=ev.target.closest('a');if(a){mm.hidden=true;d.documentElement.classList.remove('menu-open');bg.setAttribute('aria-expanded','false');}});
    d.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&!mm.hidden){closeMenu();}});
  }

  /* 3. Цели Метрики и предвыбор в форме: phone_click, b2b_request (кнопка «Обсудить обслуживание» подставляет объект «Бизнес») */
  d.addEventListener('click',function(ev){
    var a=ev.target.closest('a'); if(!a){return;}
    var h=a.getAttribute('href')||'';
    if(h.indexOf('tel:')===0){goal('phone_click');}
    if(a.hasAttribute('data-goal')){goal(a.getAttribute('data-goal'));}
    if(a.hasAttribute('data-object')){var o=d.querySelector('.zobject');if(o){o.value=a.getAttribute('data-object');}}
    if(a.hasAttribute('data-problem')){var p=d.querySelector('.zproblem');if(p){p.value=a.getAttribute('data-problem');}}
  });

  /* 4. Форма: form_start при первом фокусе, service_select при выборе услуги, видимые ошибки, защита от двойной отправки */
  var forms=d.querySelectorAll('.zform');
  for(var i=0;i<forms.length;i++){(function(f){
    var started=false;
    f.addEventListener('focusin',function(){if(!started){started=true;goal('form_start');}});
    var p=f.querySelector('.zproblem'); if(p){p.addEventListener('change',function(){goal('service_select');});}
    f.addEventListener('invalid',function(){f.classList.add('was-validated');},true); /* нативная валидация блокирует submit — подписи ошибок включаем по событию invalid */
    f.addEventListener('submit',function(ev){
      f.classList.add('was-validated');
      if(!f.checkValidity()){ev.preventDefault();var bad=f.querySelector(':invalid');if(bad){bad.focus();}return;}
      var b=f.querySelector('button[type=submit]'); if(b){b.disabled=true;b.textContent='Отправляем…';}
    });
  })(forms[i]);}

  /* 5. Заявка принята: цель считаем на /spasibo/ — только после того, как PHP принял заявку. Счётчик стартует после согласия,
        поэтому ждём появления ym, но не дольше 10 секунд. */
  if(/^(\/donetsk)?\/spasibo\/?$/.test(location.pathname)){
    var done=false, tries=0;
    var timer=setInterval(function(){
      tries++;
      if(typeof window.ym==='function'&&!done){done=true;goal('zayavka');goal('form_success');clearInterval(timer);}
      else if(tries>25){clearInterval(timer);}
    },400);
  }

  /* 6. Cookie-согласие и загрузка Метрики строго после разрешения аналитики */
  var CK_KEY='oblses.cookie.consent.v1';
  var CK_TEXT='Мы используем файлы cookie, чтобы сайт работал и становился удобнее. Нажимая «Хорошо», вы соглашаетесь с обработкой данных согласно Политике обработки персональных данных и Уведомлению об использовании cookie.';
  function ckRead(){try{var r=localStorage.getItem(CK_KEY);if(!r){return null;}var p=JSON.parse(r);return p&&typeof p==='object'?p:null;}catch(e){return null;}}
  function ckWrite(analytics){try{localStorage.setItem(CK_KEY,JSON.stringify({v:1,analytics:!!analytics,at:new Date().toISOString(),text:CK_TEXT}));}catch(e){}}
  function startMetrika(){
    if(window.__oblMetrika){return;}
    window.__oblMetrika=true;
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');
    window.ym(M,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
  }
  var ck=null, hadAnalytics=false;
  function ckBuild(){
    if(ck){return ck;}
    ck=d.createElement('div'); ck.className='ck'; ck.setAttribute('role','dialog'); ck.setAttribute('aria-label','Файлы cookie'); ck.setAttribute('aria-live','polite');
    ck.innerHTML='<div class="ck__box">'
      +'<div class="ck__main"><div><span class="eyebrow">Cookie</span><p><b>Мы используем файлы cookie</b>, чтобы сайт работал и становился удобнее. Нажимая «Хорошо», вы соглашаетесь с обработкой данных согласно <a href="/politika/">Политике обработки персональных данных</a> и <a href="/cookie/">Уведомлению об использовании cookie</a>.</p></div>'
      +'<div class="ck__btns"><button type="button" class="btn btn--pri" data-ck="all">Хорошо</button><div class="ck__row"><button type="button" class="btn btn--ghost btn--sm" data-ck="settings">Настроить</button><button type="button" class="ck__link" data-ck="necessary">Только нужные</button></div></div></div>'
      +'<div class="ck__settings" hidden><div class="ck__head"><div><span class="eyebrow">Настройки cookie</span><p class="small">Выберите, что разрешить</p></div><button type="button" class="ck__link" data-ck="back">&larr; Назад</button></div>'
      +'<div class="ck__opt"><div><b>Необходимые</b><p>Работа сайта: отправка формы, защита от спама, запоминание вашего выбора на этом баннере. Отключить нельзя.</p></div><span class="ck__on">ВКЛ</span></div>'
      +'<div class="ck__opt"><div><b>Аналитика</b><p>Статистика посещений: какие страницы читают, а какие закрывают сразу. Используется Яндекс.Метрика. Без этого разрешения счётчик не загружается.</p></div><label class="ck__sw"><input type="checkbox" checked aria-label="Разрешить аналитику"><span></span></label></div>'
      +'<div class="ck__row2"><button type="button" class="btn btn--pri" data-ck="save">Сохранить выбор</button><button type="button" class="btn btn--ghost" data-ck="all">Принять всё</button></div></div>'
      +'</div>';
    ck.addEventListener('click',function(ev){
      var b=ev.target.closest('[data-ck]'); if(!b){return;}
      var act=b.getAttribute('data-ck'), st=ck.querySelector('.ck__settings'), mn=ck.querySelector('.ck__main'), sw=ck.querySelector('.ck__sw input');
      if(act==='settings'){mn.hidden=true;st.hidden=false;}
      else if(act==='back'){st.hidden=true;mn.hidden=false;}
      else if(act==='all'){ckDecide(true);}
      else if(act==='necessary'){ckDecide(false);}
      else if(act==='save'){ckDecide(!!sw.checked);}
    });
    return ck;
  }
  function ckShow(expanded){
    var el=ckBuild(); var saved=ckRead();
    el.querySelector('.ck__sw input').checked=saved?!!saved.analytics:true;
    el.querySelector('.ck__main').hidden=!!expanded; el.querySelector('.ck__settings').hidden=!expanded;
    if(!el.parentNode){d.body.appendChild(el);} el.hidden=false;
  }
  function ckDecide(allow){
    ckWrite(allow); if(ck){ck.hidden=true;}
    if(allow){startMetrika();}
    else if(hadAnalytics&&window.__oblMetrika){location.reload();} /* согласие отозвали после старта счётчика — выгрузить его на лету нельзя */
    hadAnalytics=!!allow;
  }
  function ckInit(){
    var saved=ckRead();
    if(saved){hadAnalytics=!!saved.analytics;if(saved.analytics){startMetrika();}}
    else{ckShow(false);}
    d.addEventListener('click',function(ev){var t=ev.target.closest&&ev.target.closest('[data-cookie-settings]');if(!t){return;}ev.preventDefault();ckShow(true);});
  }
  if(d.readyState==='loading'){d.addEventListener('DOMContentLoaded',ckInit);}else{ckInit();}
})();
