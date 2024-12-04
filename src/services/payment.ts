import { PaymentConfig, PaymentData, PaymentResponse } from '../types/payment';

export async function createPixPayment(
  data: PaymentData,
  config: PaymentConfig
): Promise<PaymentResponse> {
  try {
    console.log('Iniciando criação de pagamento PIX:', {
      amount: data.transactionAmount,
      description: data.description
    });

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID()
      },
      body: JSON.stringify({
        transaction_amount: data.transactionAmount,
        description: data.description,
        payment_method_id: 'pix',
        payer: {
          email: data.payerEmail,
          first_name: data.payerFirstName,
          last_name: ''
        },
        notification_url: config.webhookUrl
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na resposta:', errorData);
      return {
        success: false,
        error: 'Erro ao gerar pagamento PIX'
      };
    }

    const result = await response.json();
    console.log('Pagamento criado:', {
      id: result.id,
      status: result.status
    });

    return {
      success: true,
      pixCopiaECola: result.point_of_interaction.transaction_data.qr_code,
      paymentId: result.id
    };
  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    return {
      success: false,
      error: 'Erro ao processar pagamento'
    };
  }
}

export function generateWebhookUrl(userId: string): string {
  return `${window.location.origin}/api/webhooks/mercadopago/${userId}`;
}