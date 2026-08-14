import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface WebhookNotification {
  event?: string;
  object?: {
    id?: string;
    status?: string;
    amount?: { value?: string; currency?: string };
    metadata?: Record<string, string>;
  };
}

export async function POST(request: Request) {
  let payload: WebhookNotification;
  try {
    payload = (await request.json()) as WebhookNotification;
  } catch {
    // ЮKassa повторяет доставку при не-200, поэтому мусорное тело
    // подтверждаем сразу и в очередь не возвращаем.
    console.error("[webhook] Некорректное тело уведомления");
    return NextResponse.json({ received: true }, { status: 200 });
  }

  const payment = payload.object;

  if (payment?.status === "succeeded") {
    const metadata = payment.metadata ?? {};
    console.log("[webhook] Платёж подтверждён", {
      paymentId: payment.id,
      orderId: metadata.orderId,
      email: metadata.email,
      plan: metadata.plan,
      topic: metadata.topic,
      amount: payment.amount?.value,
      currency: payment.amount?.currency,
    });
  } else {
    console.log("[webhook] Событие без подтверждённой оплаты", {
      event: payload.event,
      paymentId: payment?.id,
      status: payment?.status,
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
