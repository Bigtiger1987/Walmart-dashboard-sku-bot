import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// === TẠO SERVER ĐỂ UPTIMEROBOT GIỮ CHO REPLIT KHÔNG NGỦ ===
import express from "express";
const app = express();

app.get("/", (req, res) => res.send("✅ Discord SKU Bot is alive!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Web server is running on port ${PORT}`));

// === CẤU HÌNH ===
const DISCORD_TOKEN = process.env.DISCORD_TOKEN; // Dán token bot từ Discord Developer Portal
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
      const text = await response.text();

// === Format phần trăm chỉ cho cột % Growth ===
const formattedText = text
  .split("\n")
  .map((line) => {
    // Chỉ xử lý những dòng có dữ liệu (Month | Orders...)
    if (line.match(/^\d/)) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length >= 6) {
        // Cột % Growth là phần tử thứ 5 (index 4)
        let growth = parseFloat(parts[4]);
        if (!isNaN(growth)) {
          if (Math.abs(growth) < 1 && growth !== 0) {
            growth = (growth * 100).toFixed(2) + "%";
          } else {
            growth = growth.toFixed(2) + "%";
          }
        } else {
          growth = parts[4];
        }
        parts[4] = growth;
        return parts.join(" | ");
      }
    }
    return line;
  })
  .join("\n");


      await interaction.editReply(
        `📊 **SKU:** **${sku}**\n\`\`\`\n${formattedText}\n\`\`\``,
      );
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
