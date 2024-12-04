export function generateWebhookUrl(userId: string): string {
  const baseUrl = import.meta.env.VITE_API_URL || 'https://app.recargasmax.com.br';
  return `${baseUrl}/api/webhooks/mercadopago/${userId}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

export function validatePaymentConfig(accessToken: string): boolean {
  return accessToken.length > 0;
}