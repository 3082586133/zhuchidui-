const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  const { method, query, body } = req;
  const configKey = query.key; // 'intro', 'awards', 'permissions'

  try {
    if (method === 'GET') {
      const value = await kv.get(`config:${configKey}`);
      return res.status(200).json(value || {});
    }

    if (method === 'PUT') {
      await kv.set(`config:${configKey}`, body);
      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};