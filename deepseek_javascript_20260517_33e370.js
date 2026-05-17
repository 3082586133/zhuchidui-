const { kv } = require('@vercel/kv');
const { v4: uuidv4 } = require('uuid');

// 生成随机密码
function randomPassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let pw = '';
  for (let i = 0; i < 6; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

function getPosAbbr(pos) {
  if (pos === '队长') return 'dz';
  if (pos === '副部长') return 'fb';
  if (pos === '干事') return 'gs';
  if (pos === '编外成员') return 'bw';
  return 'ot';
}

// 需要在已有成员中查找最大编号，但这里首次初始化时没有成员，所以从01开始
function generateAccount(grade, pos, idx) {
  const abbr = getPosAbbr(pos);
  return `zcd${grade}${abbr}${String(idx+1).padStart(2,'0')}`;
}

module.exports = async (req, res) => {
  try {
    // 如果已有成员，不再初始化
    const existingKeys = await kv.keys('member:*');
    if (existingKeys.length > 0) {
      return res.status(200).json({ message: 'Already initialized' });
    }

    const grades = [2023, 2024, 2025];
    const awards = ['主持人大赛金奖', '校级十佳主持团队', '优秀学生组织', '年度最佳协作奖'];

    // 设置默认介绍
    await kv.set('config:intro', { value: '欢迎来到西华师范大学生命科学学院主持队！我们是一个充满活力的团队，致力于学院各类活动的主持工作。' });

    for (let gi = 0; gi < grades.length; gi++) {
      const g = grades[gi];
      await kv.set(`config:awards_${g}`, { value: awards[gi % awards.length] });

      // 2 队长
      for (let i = 0; i < 2; i++) {
        const id = uuidv4();
        const account = generateAccount(g, '队长', i);
        await kv.set(`member:${id}`, {
          id, grade: g, position: '队长', photo: '',
          name: `用户${i+1}`, teamName: `阿${i+1}`, achievement: '',
          duty: '', contact: '', account, password: randomPassword(), showOnHome: false
        });
      }
      // 4 副部长
      for (let i = 0; i < 4; i++) {
        const id = uuidv4();
        const account = generateAccount(g, '副部长', i);
        await kv.set(`member:${id}`, {
          id, grade: g, position: '副部长', photo: '',
          name: `用户${i+3}`, teamName: `阿${i+3}`, achievement: '',
          duty: '', contact: '', account, password: randomPassword(), showOnHome: false
        });
      }
      // 10 干事
      for (let i = 0; i < 10; i++) {
        const id = uuidv4();
        const account = generateAccount(g, '干事', i);
        await kv.set(`member:${id}`, {
          id, grade: g, position: '干事', photo: '',
          name: `用户${i+7}`, teamName: `阿${i+7}`, achievement: '',
          duty: '', contact: '', account, password: randomPassword(), showOnHome: false
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};