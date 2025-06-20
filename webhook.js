const validatePhone = (phone) => {
    phone = phone.replace(/\D/g, '');
    if (!phone.startsWith('62')) {
        phone = '62' + phone.replace(/^0+/, '');
    }
    return phone + '@s.whatsapp.net';
}

const handleWebhook = async (req, url, bot) => {
    try {
        const params = new URL(url, 'http://localhost').searchParams;
        const apiKey = params.get('apikey');
        
        // Ambil API key dari config
        if (apiKey !== config.system.webhookApiKey) {
            return { status: 403, message: 'Invalid API key' };
        }

        const phone = params.get('phone');
        const message = params.get('message');

        if (!phone || !message) {
            return { status: 400, message: 'Missing phone or message parameter' };
        }

        const formattedPhone = validatePhone(phone);

        await bot.core.sendMessage(formattedPhone, { text: message });
        return { status: 200, message: 'Message sent successfully' };
    } catch (error) {
        return { status: 500, message: 'Error sending message: ' + error.message };
    }
}

module.exports = { handleWebhook };
