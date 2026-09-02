'use strict';

const assert = require('node:assert/strict');
const core = require('../core.js');

assert.equal(core.formatTime(300), '05:00');
assert.equal(core.formatTime(1500), '25:00');
assert.equal(core.formatTime(-1), '00:00');

const safety = core.shuffledQuestions(core.questions, '安全性');
assert.equal(safety.length, 2);
assert.ok(safety.every(function (item) { return item.category === '安全性'; }));
assert.equal(new Set(safety.map(function (item) { return item.id; })).size, safety.length);

assert.deepEqual(core.categoryStats(core.questions, {
  'SAF-001': { status: 'mastered' },
  'SAF-002': { status: 'wrong' }
}, '安全性'), { total: 2, practiced: 2, average: 58 });

assert.equal(core.categories.length, 6);
assert.ok(core.categories.every(function (category) {
  return core.questions.some(function (item) { return item.category === category; });
}));

console.log('通过：倒计时格式、随机抽题、分类覆盖和学习统计，共 9 项检查。');
