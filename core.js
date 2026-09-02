(function (root) {
  'use strict';

  const categories = ['中医基础', '腰痛辨证', '经络腧穴', '针刺操作', '安全性', '病例分析'];
  const questions = [
    { id:'BAS-001', category:'中医基础', knowledge:'病因病机', question:'中医如何认识腰痛的基本病机？', answer:'腰为肾之府，腰痛多与肾虚、外邪侵袭及跌仆劳损有关。基本病机可概括为经脉痹阻、不通则痛，或腰府失养、不荣则痛。临证需分清外感、内伤及虚实。', points:['腰为肾之府','不通则痛','不荣则痛','辨外感内伤与虚实'] },
    { id:'BAS-002', category:'中医基础', knowledge:'治则治法', question:'腰痛治疗中“标本兼顾”应如何理解？', answer:'急性疼痛明显时可先祛邪通络、活血止痛以治标；慢性或反复发作者应重视补益肝肾、强腰壮骨以治本。同时根据寒湿、湿热、瘀血等兼证随证加减。', points:['急则治标','缓则治本','祛邪通络','补益肝肾'] },
    { id:'SYN-001', category:'腰痛辨证', knowledge:'寒湿腰痛', question:'寒湿腰痛的辨证要点和治法是什么？', answer:'腰部冷痛重着，转侧不利，静卧痛不减，阴雨天或受寒后加重，舌苔白腻，脉沉而迟缓。治宜散寒行湿、温经通络。', points:['冷痛重着','遇寒加重','苔白腻、脉沉迟','散寒行湿，温经通络'] },
    { id:'SYN-002', category:'腰痛辨证', knowledge:'瘀血腰痛', question:'瘀血腰痛有哪些典型表现？', answer:'腰痛如刺，痛有定处，日轻夜重，俯仰不便，常有跌仆损伤史。舌质暗紫或有瘀斑，脉涩。治宜活血化瘀、通络止痛。', points:['刺痛且痛有定处','日轻夜重','舌暗或瘀斑、脉涩','活血化瘀'] },
    { id:'SYN-003', category:'腰痛辨证', knowledge:'肾虚腰痛', question:'如何鉴别肾阴虚腰痛与肾阳虚腰痛？', answer:'二者均可见腰部酸软、绵绵作痛。肾阳虚偏冷，兼畏寒肢冷，舌淡脉沉细无力；肾阴虚偏热，兼心烦失眠、口燥咽干、手足心热，舌红少苔、脉弦细数。', points:['共同点为腰酸软','阳虚有寒象','阴虚有热象','结合舌脉鉴别'] },
    { id:'MER-001', category:'经络腧穴', knowledge:'常用腧穴', question:'毫针治疗腰痛常用哪些主穴？说明基本选穴思路。', answer:'常取肾俞、大肠俞、阿是穴、委中等。局部取穴可疏通腰部气血，循经远取委中体现“腰背委中求”，肾俞兼顾腰为肾之府，再依证型配穴。', points:['肾俞','大肠俞与阿是穴','委中','局部与循经远取结合'] },
    { id:'MER-002', category:'经络腧穴', knowledge:'穴位定位', question:'请说明肾俞穴和大肠俞穴的定位。', answer:'肾俞在脊柱区，第2腰椎棘突下，后正中线旁开1.5寸；大肠俞在脊柱区，第4腰椎棘突下，后正中线旁开1.5寸。', points:['肾俞：L2棘突下','大肠俞：L4棘突下','均旁开1.5寸'] },
    { id:'OPE-001', category:'针刺操作', knowledge:'进针操作', question:'腰部腧穴针刺前应完成哪些规范操作？', answer:'核对患者信息并评估适应证、禁忌证及当时状态，解释操作并取得配合；选择合适体位，暴露和定位穴位；检查针具，规范手卫生与皮肤消毒，操作中密切观察患者反应。', points:['核对与评估','告知并取得配合','正确体位与定位','手卫生和消毒'] },
    { id:'OPE-002', category:'针刺操作', knowledge:'补泻手法', question:'毫针得气后，如何根据虚实选择基本手法？', answer:'应在辨证和患者耐受基础上施术。虚证多用补法，实证多用泻法，虚实夹杂者可用平补平泻。任何手法均应避免过强刺激，并持续询问患者感受。', points:['辨证施术','虚则补、实则泻','虚实夹杂平补平泻','以患者耐受为度'] },
    { id:'SAF-001', category:'安全性', knowledge:'晕针处理', question:'针刺过程中患者出现晕针，应如何处理？', answer:'立即停止针刺并迅速起针，使患者平卧，注意保暖和通风，松开衣带；轻者可给予温开水或糖水并观察；症状严重或持续不缓解时，应监测生命体征并及时采取医疗急救措施。', points:['立即停针并起针','平卧、保暖、通风','密切观察','严重时及时急救'] },
    { id:'SAF-002', category:'安全性', knowledge:'禁忌与慎用', question:'哪些情况下应暂缓或慎用针刺治疗腰痛？', answer:'不能配合、过度疲劳、饥饿、醉酒或情绪极度紧张者应先调整状态；局部皮肤感染、溃疡处不宜针刺；有严重出血倾向、生命体征不稳或病情危重者应慎用；孕妇腰骶部须慎用。', points:['患者状态不佳','局部感染破损','出血风险或危重状态','孕妇慎刺'] },
    { id:'CAS-001', category:'病例分析', knowledge:'寒湿病例', question:'患者受寒后腰部冷痛重着，活动受限，遇阴雨加重，苔白腻、脉沉缓。请进行辨证并说明针刺方案。', answer:'辨为寒湿腰痛，治宜散寒行湿、温经通络。可取肾俞、大肠俞、阿是穴、委中为主，配腰阳关等，可结合温针或艾灸。操作前需排除急性严重病变。', points:['辨证：寒湿腰痛','散寒行湿、温经通络','主穴与辨证配穴','先排除危险情况'] },
    { id:'CAS-002', category:'病例分析', knowledge:'瘀血病例', question:'患者三个月前扭伤腰部，现疼痛固定如刺，夜间加重，舌暗有瘀斑。如何辨证施治？', answer:'辨为瘀血腰痛，治宜活血化瘀、通络止痛。可选阿是穴、大肠俞、委中、膈俞等，局部与循经取穴结合，刺激量须根据体质和疼痛情况调整。', points:['辨证：瘀血腰痛','活血化瘀、通络止痛','合理选穴','控制刺激量'] }
  ];

  function formatTime(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    return String(Math.floor(safe / 60)).padStart(2, '0') + ':' + String(safe % 60).padStart(2, '0');
  }

  function shuffledQuestions(source, category) {
    const pool = source.filter(function (item) { return !category || item.category === category; }).slice();
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pool[i]; pool[i] = pool[j]; pool[j] = temp;
    }
    return pool;
  }

  function progressPercent(status) {
    return status === 'mastered' ? 100 : status === 'unsure' ? 50 : status === 'wrong' ? 15 : 0;
  }

  function categoryStats(source, progress, category) {
    const pool = source.filter(function (item) { return item.category === category; });
    const practiced = pool.filter(function (item) { return progress[item.id]; });
    const average = practiced.length ? Math.round(practiced.reduce(function (sum, item) {
      return sum + progressPercent(progress[item.id].status);
    }, 0) / practiced.length) : 0;
    return { total: pool.length, practiced: practiced.length, average: average };
  }

  const api = { categories, questions, formatTime, shuffledQuestions, progressPercent, categoryStats };
  root.TrainerCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
