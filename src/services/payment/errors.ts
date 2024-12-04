import { PaymentResponse } from './types';
import { PAYMENT_ERROR_MESSAGES } from './constants';

export async function handleApiError(response: Response): Promise<PaymentResponse> {
  try {
    const errorData = await response.json();
    console.error('Payment API error:', errorData);

    if (response.status === 401) {
      return {
        success: false,
        error: PAYMENT_ERROR_MESSAGES.INVALID_TOKEN
      };
    }

    return {
      success: false,
      error: errorData.message || PAYMENT_ERROR_MESSAGES.GENERIC_ERROR
    };
  } catch (error) {
    console.error('Error parsing API error:', error);
    return {
      success: false,
      error: PAYMENT_ERROR_MESSAGES.NETWORK_ERROR
    };
  }
}