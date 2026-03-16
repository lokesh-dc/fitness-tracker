const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function sendTelegramMessage(chatId: string, message: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN is not set');
    return { success: false, error: 'Token missing' };
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      }
    );

    const data = await response.json();
    return { success: data.ok, data };
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return { success: false, error };
  }
}

export async function sendWorkoutReminder(chatId: string, planName: string) {
  const message = `
🏋️ <b>Time to Lift!</b>

Your <b>${planName}</b> session is ready for today. 
Don't let those PRs break themselves!

<a href="${process.env.NEXTAUTH_URL}/dashboard">Open Dashboard & Log Workout</a>
  `;
  
  return sendTelegramMessage(chatId, message);
}
