import emailjs from '@emailjs/browser';

export interface EmailTemplateParams {
  from_name: string;
  from_email: string;
  from_mobile: string;
  message: string;
  to_name?: string;
  reply_to?: string;
}

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export const getEmailConfig = (): EmailConfig => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  
  if (!serviceId || !templateId || !publicKey) {
    throw new Error('EmailJS configuration missing in environment variables');
  }

  return { serviceId, templateId, publicKey };
};

export const sendContactEmail = async (params: EmailTemplateParams): Promise<any> => {
  const config = getEmailConfig();
  
  const templateParams = {
    ...params,
    to_name: params.to_name || 'Admin',
    reply_to: params.reply_to || params.from_email,
  };

  console.log('Sending email with parameters:', templateParams);

  const result = await emailjs.send(
    config.serviceId,
    config.templateId,
    templateParams,
    config.publicKey
  );

  console.log('Email sent successfully:', result);
  return result;
};