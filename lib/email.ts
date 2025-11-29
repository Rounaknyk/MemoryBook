import emailjs from '@emailjs/browser';

interface MemoryNotificationParams {
    to_email: string;
    from_name: string;
    link: string;
    message?: string;
}

export const sendMemoryNotification = async ({
    to_email,
    from_name,
    link,
    message = 'A new memory has been posted!',
}: MemoryNotificationParams) => {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
        console.warn('EmailJS environment variables are missing. Notification not sent.');
        return;
    }

    try {
        const response = await emailjs.send(
            serviceId,
            templateId,
            {
                to_email,
                from_name,
                link,
                message,
            },
            publicKey
        );
        return response;
    } catch (error) {
        console.error('Failed to send memory notification email:', error);
        throw error;
    }
};
