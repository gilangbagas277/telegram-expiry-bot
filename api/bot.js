const { Telegraf } = require('telegraf');
const connectDB = require('../lib/db');
const User = require('../models/User');

const bot = new Telegraf(process.env.BOT_TOKEN);
const GROUP_ID = process.env.GROUP_ID;

bot.start((ctx) => ctx.reply("🤖 Bot Panel Aktif!\n\n/add [ID] [Hari] - Tambah User & Link\n/cek [ID] - Cek Masa Aktif"));

bot.command('add', async (ctx) => {
  if (ctx.from.id.toString() !== process.env.ADMIN_ID) return ctx.reply("❌ Akses Ditolak.");
  
  const args = ctx.message.text.split(' ');
  if (args.length !== 3) return ctx.reply("Gunakan: /add [ID] [Hari]");

  const targetId = args[1];
  const days = parseInt(args[2]);
  const exp = new Date();
  exp.setDate(exp.getDate() + days);

  try {
    await connectDB();
    await User.findOneAndUpdate(
      { userId: targetId },
      { expiryDate: exp, isKicked: false },
      { upsert: true }
    );

    // Membuat link sekali pakai
    const invite = await ctx.telegram.createChatInviteLink(GROUP_ID, {
      member_limit: 1,
      name: `Akses-${targetId}`
    });

    ctx.reply(
      `✅ Pendaftaran Berhasil!\n\n` +
      `🆔 ID: ${targetId}\n` +
      `⏳ Durasi: ${days} Hari\n` +
      `🗓️ Expired: ${exp.toLocaleString('id-ID')}\n\n` +
      `🔗 Link Undangan: ${invite.invite_link}`,
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    ctx.reply("❌ Error: " + err.message);
  }
});

bot.command('cek', async (ctx) => {
  const targetId = ctx.message.text.split(' ')[1] || ctx.from.id;
  await connectDB();
  const data = await User.findOne({ userId: targetId });
  if (!data) return ctx.reply("User tidak terdaftar.");
  ctx.reply(`📊 Status Member\nID: ${targetId}\nExpired: ${data.expiryDate.toLocaleString('id-ID')}`);
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await connectDB();
    await bot.handleUpdate(req.body);
    return res.status(200).send('OK');
  }
  res.status(200).send('Bot is Running...');
    }
