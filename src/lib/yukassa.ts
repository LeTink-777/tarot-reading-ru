import { randomUUID } from "node:crypto";
import { Configuration, PaymentsApi, type CreatePaymentRequest, type Payment } from "@yookassa/sdk";

const shopId = process.env.NEXT_PUBLIC_YUKASSA_SHOP_ID;
const secretKey = process.env.YUKASSA_SECRET_KEY;

/** Ключи задаются переменными окружения и никогда не попадают в репозиторий. */
export function isYukassaConfigured(): boolean {
  return Boolean(shopId && secretKey);
}

let cachedApi: PaymentsApi | null = null;

function getPaymentsApi(): PaymentsApi {
  if (!shopId || !secretKey) {
    throw new Error(
      "ЮKassa не настроена: задайте NEXT_PUBLIC_YUKASSA_SHOP_ID и YUKASSA_SECRET_KEY",
    );
  }
  if (!cachedApi) {
    cachedApi = new PaymentsApi(
      new Configuration({ username: shopId, password: secretKey }),
    );
  }
  return cachedApi;
}

/** Сумма в формате ЮKassa: две цифры после запятой. */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

export interface CreatePaymentResult {
  paymentId: string;
  status: string;
  confirmationUrl: string;
}

export interface FetchedPayment {
  id: string;
  status: string;
  metadata: Record<string, string>;
}

/**
 * Читает платёж по идентификатору.
 *
 * Нужен, чтобы подтвердить: запрос на скачивание относится к реально
 * оплаченному заказу, и чтобы взять данные расклада из самого платежа,
 * а не из тела запроса браузера.
 */
export async function getPayment(paymentId: string): Promise<FetchedPayment | null> {
  const api = getPaymentsApi();

  try {
    const response = await api.paymentsPaymentIdGet(paymentId);
    const payment = response.data as Payment;

    return {
      id: String(payment.id),
      status: String(payment.status),
      metadata: (payment.metadata ?? {}) as Record<string, string>,
    };
  } catch {
    // Неизвестный идентификатор — для вызывающего это просто «нет платежа».
    return null;
  }
}

export async function createPayment(
  amount: number,
  orderId: string,
  description: string,
  returnUrl: string,
  metadata: Record<string, string> = {},
): Promise<CreatePaymentResult> {
  const api = getPaymentsApi();

  const request: CreatePaymentRequest = {
    amount: { value: formatAmount(amount), currency: "RUB" },
    capture: true,
    description: description.slice(0, 128),
    confirmation: { type: "redirect", return_url: returnUrl },
    // Без payment_method_data ЮKassa показывает все подключённые способы
    // оплаты: карта, SberPay, СБП, T-Pay, ЮMoney.
    metadata: { orderId, ...metadata },
  };

  const response = await api.paymentsPost(randomUUID(), request);
  const payment = response.data as Payment;

  const confirmation = payment.confirmation as { confirmation_url?: string } | undefined;
  const confirmationUrl = confirmation?.confirmation_url;

  if (!confirmationUrl) {
    throw new Error("ЮKassa не вернула ссылку на оплату");
  }

  return {
    paymentId: String(payment.id),
    status: String(payment.status),
    confirmationUrl,
  };
}
