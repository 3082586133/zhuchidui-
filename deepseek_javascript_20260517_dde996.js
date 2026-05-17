const { kv } = require('@vercel/kv');
const { v4: uuidv4 } = require('uuid');

module.exports = async (req, res) => {
  const { method, query, body } = req;
  const memberId = query.id;

  try {
    if (method === 'GET') {
      if (memberId) {
        const data = await kv.get(`member:${memberId}`);
        return res.status(200).json(data || null);
      }
      const keys = await kv.keys('member:*');
      const members = [];
      for (const key of keys) {
        const m = await kv.get(key);
        if (m) members.push(m);
      }
      return res.status(200).json(members);
    }

    if (method === 'POST') {
      const id = uuidv4();
      const member = { id, ...body };
      await kv.set(`member:${id}`, member);
      return res.status(201).json(member);
    }

    if (method === 'PUT' && memberId) {
      await kv.set(`member:${memberId}`, { ...body, id: memberId });
      return res.status(200).json({ success: true });
    }

    if (method === 'DELETE' && memberId) {
      await kv.del(`member:${memberId}`);
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};