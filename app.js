(function () {
  'use strict';

  const core = window.TrainerCore;
  const app = document.getElementById('app');
  const STORAGE_KEY = 'acupuncture-exam-progress-v1';
  const categoryMeta = {
    '中医基础': ['基', '#26758e'], '腰痛辨证': ['辨', '#7b66a1'], '经络腧穴': ['穴', '#287b6d'],
    '针刺操作': ['针', '#ad7336'], '安全性': ['安', '#ad5555'], '病例分析': ['案', '#526f9a']
  };
  const labels = { mastered: '已掌握', unsure: '不熟悉', wrong: '错题' };
  let page = 'home';
  let bankFilter = '全部';
  let examQueue = [];
  let examIndex = 0;
  let examRemaining = 1500;
  let examTimerState = 'idle';
  let examEndAt = 0;
  let progress = loadProgress();
  let activeTimer = null;

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch (_) { return {}; }
  }
  function saveProgress() { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
  function escapeHtml(value) {
    const span = document.createElement('span'); span.textContent = String(value); return span.innerHTML;
  }
  function icon(name) { return '<span class="icon" aria-hidden="true">' + name + '</span>'; }

  function shell(content) {
    const titles = { home:'毫针治疗腰痛', statement:'5分钟自我陈述', exam:'25分钟模拟答辩', bank:'分类题库', stats:'学习统计' };
    app.innerHTML = '<div class="app-shell">' +
      '<aside class="sidebar" id="sidebar"><div class="brand"><div class="brand-mark">针</div><div><strong>确有专长</strong><small>答辩训练器</small></div></div>' +
      '<nav><p>备考训练</p>' + navButton('home','⌂','训练中心') + navButton('bank','▤','分类题库') + navButton('stats','▥','学习统计') +
      '<p>快捷训练</p>' + navButton('statement','◷','5分钟自述') + navButton('exam','◇','模拟答辩') + '</nav>' +
      '<div class="local-note">▣ <span><b>本地安全存储</b><small>学习记录仅保存在此浏览器</small></span></div></aside>' +
      '<button class="scrim" id="scrim" aria-label="关闭菜单"></button><main><header class="topbar"><button id="menuButton" class="menu-button" aria-label="打开菜单">☰</button>' +
      '<div><small>中医医术确有专长</small><h1>' + titles[page] + '</h1></div><span class="today">◷ ' + formatDate() + '</span></header>' +
      '<div class="page-wrap">' + content + '</div></main>' +
      '<nav class="bottom-nav">' + navButton('home','⌂','训练') + navButton('bank','▤','题库') + navButton('stats','▥','统计') + '</nav></div>';
    bindShell();
  }
  function navButton(target, symbol, label) {
    return '<button data-page="' + target + '" class="' + (page === target ? 'active' : '') + '">' + icon(symbol) + '<span>' + label + '</span></button>';
  }
  function formatDate() {
    return new Intl.DateTimeFormat('zh-CN',{ month:'long', day:'numeric', weekday:'short' }).format(new Date());
  }
  function bindShell() {
    document.querySelectorAll('[data-page]').forEach(function (button) {
      button.addEventListener('click', function () { navigate(button.dataset.page); });
    });
    const menu = document.getElementById('menuButton');
    const scrim = document.getElementById('scrim');
    if (menu) menu.addEventListener('click', function () { document.getElementById('sidebar').classList.add('open'); scrim.classList.add('show'); });
    if (scrim) scrim.addEventListener('click', function () { document.getElementById('sidebar').classList.remove('open'); scrim.classList.remove('show'); });
  }
  function navigate(target) {
    if (page === 'exam' && examTimerState === 'running') {
      examRemaining = Math.max(0, Math.ceil((examEndAt - Date.now()) / 1000));
      examTimerState = 'paused';
    }
    stopTimer(); page = target; window.scrollTo(0, 0); render();
  }

  function render() {
    if (page === 'statement') renderStatement();
    else if (page === 'exam') renderExam();
    else if (page === 'bank') renderBank();
    else if (page === 'stats') renderStats();
    else renderHome();
  }

  function renderHome() {
    const values = Object.values(progress);
    const mastered = values.filter(function (x) { return x.status === 'mastered'; }).length;
    const weak = values.length - mastered;
    const rate = values.length ? Math.round(mastered / values.length * 100) : 0;
    const categoryCards = core.categories.map(function (category) {
      const meta = categoryMeta[category], stats = core.categoryStats(core.questions, progress, category);
      return '<button class="category-card" data-open-bank="' + category + '"><i style="background:' + meta[1] + '18;color:' + meta[1] + '">' + meta[0] + '</i><span><b>' + category + '</b><small>' + stats.total + ' 道题 · 已练 ' + stats.practiced + '</small></span><em>›</em></button>';
    }).join('');
    shell('<section class="welcome"><div><small class="kicker">今日训练</small><h2>循序训练，从容应答</h2><p>围绕毫针治疗腰痛，完成一次有针对性的答辩练习。</p></div><div class="practice-count">✦ <b>' + values.length + '</b><span>道已练习</span></div></section>' +
      '<section class="training-grid"><article class="hero-card teal"><span class="hero-icon">◷</span><small>5 MIN</small><h3>自我陈述训练</h3><p>跟随结构化提纲，完成个人医术专长与技术特点陈述。</p><footer><span>✓ 6项陈述提纲</span><button data-go="statement">开始训练　›</button></footer></article>' +
      '<article class="hero-card navy"><span class="hero-icon">◇</span><small>25 MIN</small><h3>模拟答辩</h3><p>六大知识分类随机抽题，先独立作答，再对照参考答案。</p><footer><span>↻ 随机不重复</span><button data-go="exam">进入答辩　›</button></footer></article></section>' +
      '<section class="home-grid"><div class="panel"><header class="panel-title"><div><small class="kicker">知识体系</small><h3>六大训练分类</h3></div><button data-go="bank">查看题库 ›</button></header><div class="category-grid">' + categoryCards + '</div></div>' +
      '<aside class="panel progress-panel"><small class="kicker">学习进度</small><h3>当前掌握情况</h3><div class="score-ring" style="--score:' + rate + '"><div><b>' + rate + '%</b><span>综合掌握率</span></div></div><div class="mini-stats"><span><b>' + mastered + '</b>已掌握</span><span><b>' + weak + '</b>待巩固</span></div><button class="outline" data-go="stats">查看学习报告 ›</button></aside></section>');
    bindGoButtons();
    document.querySelectorAll('[data-open-bank]').forEach(function (button) { button.onclick = function () { bankFilter = button.dataset.openBank; navigate('bank'); }; });
  }

  function bindGoButtons() {
    document.querySelectorAll('[data-go]').forEach(function (button) { button.onclick = function () { navigate(button.dataset.go); }; });
  }

  function renderStatement() {
    const prompts = ['医术渊源与学习经历','专长技术与适用范围','对腰痛病因病机的认识','辨证、选穴与配穴思路','针刺操作与安全措施','典型病例与疗效说明'];
    shell('<div class="focus-grid"><section class="panel timer-panel"><div class="training-heading"><i>◷</i><div><small class="kicker">SELF STATEMENT</small><h2>5分钟自我陈述</h2></div></div>' + timerMarkup('statementTimer', 300) + '</section>' +
      '<aside class="panel"><header class="panel-title"><div><small class="kicker">表达框架</small><h3>自我陈述提纲</h3></div><span class="tag">6 项</span></header><p class="muted">建议按顺序展开，注意突出个人专长与临床安全。</p><ol class="prompt-list">' + prompts.map(function (text,i) { return '<li><i>' + (i+1) + '</i><span>' + text + '</span></li>'; }).join('') + '</ol><div class="tip">! <span><b>训练提示</b>最后1分钟请总结技术特色和安全边界。</span></div></aside></div>');
    startTimerController('statementTimer', 300);
  }

  function timerMarkup(id, seconds) {
    return '<div class="timer-wrap"><div class="timer-ring large" id="' + id + 'Ring" style="--remaining:100"><div><span>剩余时间</span><b id="' + id + 'Value">' + core.formatTime(seconds) + '</b><small id="' + id + 'Hint">保持节奏，从容表达</small></div></div></div><div class="timer-actions"><button class="primary" id="' + id + 'Toggle">▶ 开始计时</button><button class="outline" id="' + id + 'Reset">↻ 重置</button></div><div class="finished" id="' + id + 'Finished">✓ 本次计时已完成，请回顾答题要点。</div>';
  }

  function startTimerController(id, total) {
    let remaining = total, state = 'idle', endAt = 0;
    const value = document.getElementById(id + 'Value'), ring = document.getElementById(id + 'Ring');
    const toggle = document.getElementById(id + 'Toggle'), reset = document.getElementById(id + 'Reset');
    const hint = document.getElementById(id + 'Hint'), finished = document.getElementById(id + 'Finished');
    function paint() {
      value.textContent = core.formatTime(remaining); ring.style.setProperty('--remaining', Math.round(remaining / total * 100));
      hint.textContent = remaining <= 60 ? '请完成当前内容' : '保持节奏，从容表达';
    }
    function tick() {
      remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000)); paint();
      if (!remaining) { stopTimer(); state = 'finished'; toggle.disabled = true; finished.classList.add('show'); }
    }
    toggle.onclick = function () {
      if (state === 'running') { tick(); stopTimer(); state = 'paused'; toggle.textContent = '▶ 继续'; }
      else { state = 'running'; endAt = Date.now() + remaining * 1000; toggle.textContent = 'Ⅱ 暂停'; tick(); activeTimer = setInterval(tick, 250); }
    };
    reset.onclick = function () { stopTimer(); remaining = total; state = 'idle'; toggle.disabled = false; toggle.textContent = '▶ 开始计时'; finished.classList.remove('show'); paint(); };
    paint();
  }
  function stopTimer() { if (activeTimer) { clearInterval(activeTimer); activeTimer = null; } }

  function newExam() { examQueue = core.shuffledQuestions(core.questions); examIndex = 0; }
  function renderExam() {
    if (!examQueue.length) newExam();
    const q = examQueue[examIndex], meta = categoryMeta[q.category];
    shell('<section class="exam-toolbar"><div>◷ <span>剩余时间</span><b id="examTimerValue">' + core.formatTime(examRemaining) + '</b></div><span>第 ' + (examIndex+1) + ' / ' + examQueue.length + ' 题</span><div><button id="examTimerToggle">' + (examTimerState === 'running' ? 'Ⅱ 暂停' : examTimerState === 'idle' ? '▶ 开始计时' : '▶ 继续') + '</button><button id="examTimerReset">↻</button></div></section>' +
      '<section class="panel question-panel"><div class="question-meta"><span style="color:' + meta[1] + ';background:' + meta[1] + '14">' + q.category + '</span><span>知识点：' + q.knowledge + '</span><em>' + q.id + '</em></div><h2>' + q.question + '</h2>' +
      '<div class="response"><label for="responseText">我的回答</label><textarea id="responseText" placeholder="在这里记录答题思路，也可以直接口头作答……"></textarea><label class="oral"><input id="oralDone" type="checkbox"><i>✓</i>我已完成口头作答</label></div>' +
      '<div class="locked" id="locked">▣ <span>完成文字或口头作答后，才可查看参考答案</span><button class="primary" id="showAnswer" disabled>完成作答，查看答案</button></div>' +
      '<div class="answer" id="answer"><header>✓ 参考答案 <small>请对照要点进行自我评估</small></header><p>' + q.answer + '</p><b>答题要点</b><ul>' + q.points.map(function (p) { return '<li>✓ ' + p + '</li>'; }).join('') + '</ul></div>' +
      '<div class="assessment" id="assessment"><div><b>这道题掌握得怎么样？</b><small>选择后进入下一题</small></div><div class="status-actions"><button data-status="mastered">✓ 已掌握</button><button data-status="unsure">! 不熟悉</button><button data-status="wrong">× 错题</button></div><button class="primary" id="nextQuestion" disabled>下一题 ›</button></div></section>');
    bindExam(q);
  }

  function bindExam(q) {
    const value = document.getElementById('examTimerValue'), toggle = document.getElementById('examTimerToggle');
    function tick() { examRemaining = Math.max(0, Math.ceil((examEndAt-Date.now())/1000)); value.textContent = core.formatTime(examRemaining); if (!examRemaining) { stopTimer(); examTimerState='finished'; toggle.disabled=true; } }
    function runTimer() { examTimerState='running'; examEndAt=Date.now()+examRemaining*1000; toggle.textContent='Ⅱ 暂停'; activeTimer=setInterval(tick,250); }
    if (examTimerState === 'running') { stopTimer(); activeTimer=setInterval(tick,250); }
    if (examTimerState === 'finished') toggle.disabled = true;
    toggle.onclick = function () { if(examTimerState==='running'){tick();stopTimer();examTimerState='paused';toggle.textContent='▶ 继续';}else{runTimer();} };
    document.getElementById('examTimerReset').onclick = function(){stopTimer();examRemaining=1500;examTimerState='idle';value.textContent='25:00';toggle.disabled=false;toggle.textContent='▶ 开始计时';};
    const text = document.getElementById('responseText'), oral = document.getElementById('oralDone'), show = document.getElementById('showAnswer');
    function validate(){ show.disabled = !text.value.trim() && !oral.checked; }
    text.oninput=validate; oral.onchange=validate;
    show.onclick=function(){ document.getElementById('locked').classList.add('hide');document.getElementById('answer').classList.add('show');document.getElementById('assessment').classList.add('show');text.disabled=true;oral.disabled=true; };
    document.querySelectorAll('[data-status]').forEach(function(button){button.onclick=function(){document.querySelectorAll('[data-status]').forEach(function(x){x.className='';});button.className=button.dataset.status;progress[q.id]={status:button.dataset.status,attempts:(progress[q.id] ? progress[q.id].attempts : 0)+1,updatedAt:new Date().toISOString()};saveProgress();document.getElementById('nextQuestion').disabled=false;};});
    document.getElementById('nextQuestion').onclick=function(){if(examTimerState==='running')tick();stopTimer();examIndex+=1;if(examIndex>=examQueue.length)newExam();renderExam();};
  }

  function renderBank() {
    const filtered = bankFilter === '全部' ? core.questions : core.questions.filter(function(q){return q.category===bankFilter;});
    const tabs = ['全部'].concat(core.categories).map(function(c){const n=c==='全部'?core.questions.length:core.questions.filter(function(q){return q.category===c;}).length;return '<button data-filter="'+c+'" class="'+(bankFilter===c?'active':'')+'">'+c+' <small>'+n+'</small></button>';}).join('');
    const rows = filtered.map(function(q,i){const item=progress[q.id];return '<article class="bank-row"><span>'+String(i+1).padStart(2,'0')+'</span><div><small style="color:'+categoryMeta[q.category][1]+'">'+q.category+'　·　'+q.knowledge+'</small><h3>'+q.question+'</h3></div><em class="pill '+(item?item.status:'new')+'">'+(item?labels[item.status]:'未练习')+'</em></article>';}).join('');
    shell('<section class="page-heading"><div><small class="kicker">QUESTION BANK</small><h2>分类题库</h2><p>围绕答辩核心知识体系，逐项巩固专业表达。</p></div><button class="primary" data-go="exam">↻ 随机抽题</button></section><div class="tabs">'+tabs+'</div><section class="question-list">'+rows+'</section>');
    bindGoButtons();document.querySelectorAll('[data-filter]').forEach(function(b){b.onclick=function(){bankFilter=b.dataset.filter;renderBank();};});
  }

  function renderStats() {
    const values=Object.values(progress), count=function(s){return values.filter(function(x){return x.status===s;}).length;};
    const stats=core.categories.map(function(c){return Object.assign({category:c},core.categoryStats(core.questions,progress,c));});
    const practiced=stats.filter(function(x){return x.practiced;}).sort(function(a,b){return a.average-b.average;}); const weakest=practiced[0];
    const cards=[['◎','累计练习',values.reduce(function(s,x){return s+x.attempts;},0),'次','blue'],['✓','已掌握',count('mastered'),'题','green'],['!','不熟悉',count('unsure'),'题','orange'],['×','错题',count('wrong'),'题','red']].map(function(x){return '<article><i class="'+x[4]+'">'+x[0]+'</i><span><small>'+x[1]+'</small><b>'+x[2]+' <em>'+x[3]+'</em></b></span></article>';}).join('');
    const bars=stats.map(function(s){return '<div class="bar-row"><span><i style="background:'+categoryMeta[s.category][1]+'"></i><b>'+s.category+'</b><small>'+s.practiced+'/'+s.total+' 已练</small></span><div><i style="width:'+s.average+'%;background:'+categoryMeta[s.category][1]+'"></i></div><b>'+s.average+'%</b></div>';}).join('');
    shell('<section class="page-heading"><div><small class="kicker">LEARNING REPORT</small><h2>学习统计</h2><p>掌握训练节奏，优先巩固薄弱知识点。</p></div><button class="primary" data-go="exam">▶ 继续训练</button></section><section class="summary-grid">'+cards+'</section><section class="stats-grid"><div class="panel"><header class="panel-title"><div><small class="kicker">分类表现</small><h3>知识掌握情况</h3></div></header><div class="bar-list">'+bars+'</div></div><aside class="panel weak"><i>◇</i><small class="kicker">薄弱知识点</small><h3>'+(weakest?weakest.category:'完成训练后生成')+'</h3><p>'+(weakest?'当前掌握率 '+weakest.average+'%，建议优先进行该分类的专项复习。':'目前还没有训练记录。完成几道题后，这里将自动分析您的薄弱分类。')+'</p><button class="outline" data-go="exam">'+(weakest?'开始强化训练':'开始首次训练')+' ›</button></aside></section>');bindGoButtons();
  }

  render();
})();
