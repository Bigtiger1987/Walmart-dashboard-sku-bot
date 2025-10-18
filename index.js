import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";
import express from "express";

// === TẠO SERVER ĐỂ RENDER KHÔNG NGỦ ===
const app = express();
app.get("/", (req, res) => res.send("✅ Walmart Dashboard Bot is alive!"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Web server is running on port ${PORT}`));

// === CẤU HÌNH ===
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzLf-HhFF768VjYiqA2rJqz92U4TA0-T_4rRsnP5o2GQV0MFcymokO50xQIJE953sVY/exec"; // Link Script WebApp của bạn

// === KHỞI TẠO BOT ===
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", () => {
  console.log(`🤖 Bot đã online: ${client.user.tag}`);
});

// === SLASH COMMAND ===
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName, options } = interaction;

  if (commandName === "sku") {
    const sku = options.getString("code");
    await interaction.deferReply();

    try {
      const response = await fetch(`${SCRIPT_URL}?sku=${sku}`);
      let text = await response.text();

      await interaction.editReply(text);

    } catch (err) {
      await interaction.editReply("❌ Lỗi khi lấy dữ liệu từ Google Script!");
      console.error(err);
    }
  }
});

// === ĐĂNG KÝ COMMAND ===
client.on("ready", async () => {
  const data = [
    {
      name: "sku",
      description: "Xem báo cáo theo mã SKU từ Google Sheet",
      options: [
        {
          name: "code",
          type: 3,
          description: "Nhập mã SKU (ví dụ: RA-COA-10)",
          required: true,
        },
      ],
    },
  ];
  await client.application.commands.set(data);
  console.log("✅ Slash command /sku đã được đăng ký!");
});

client.login(DISCORD_TOKEN);
