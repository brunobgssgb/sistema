import { PaymentConfig, PaymentData, PaymentResponse } from './types';
import { handleApiError } from './errors';
import { MERCADO_PAGO_API_URL } from './constants';

export async function createPixPayment(
  data: PaymentData,
  config: PaymentConfig
): Promise<PaymentResponse> {
  try {
    const response = await fetch(`${MERCADO_PAGO_API_URL}/payments`, {
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
      return handleApiError(response);
    }

    const result = await response.json();

    return {
      success: true,
      pixCopiaECola: result.point_of_interaction.transaction_data.qr_code,
      paymentId: result.id
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      success: false,
      error: 'Erro ao processar pagamento'
    };
  }
}