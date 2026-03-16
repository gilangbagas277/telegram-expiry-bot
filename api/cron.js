const { Telegraf } = require('telegraf');
const connectDB = require('../lib/db');
const User = require('../models/User');

const bot = new Telegraf(process.env.BOT_TOKEN);

export default async function handler(req, res) {
  // Proteksi Header Cron Vercel
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send('Unauthorized');
  }

  try {
    await connectDB();
    const now = new Date();
    const expiredUsers = await User.find({ expiryDate: { $lte: now }, isKicked: false });

    for (const user of expiredUsers) {
      try {
        await bot.telegram.banChatMember(process.env.GROUP_ID, user.userId);
        await bot.telegram.unbanChatMember(process.env.GROUP_ID, user.userId);
        
        user.isKicked = true;
        await user.save();
        
        await bot.telegram.sendMessage(user.userId, "⚠️ Masa aktif habis, Anda telah dikeluarkan.");
      } catch (e) {
        console.error(`Kick error ID ${user.userId}:`, e.message);
      }
    }
    res.status(200).json({ status: "Success", kicked: expiredUsers.length });
  } catch (error) {
    res.status(500).send(error.message);
  }
}
