import { NextResponse } from "next/server";
import { generatePDF } from "@/lib/pdf-generator";
import { sendResultEmail } from "@/lib/email";
import {
  buildSubtitle,
  generateResultSections,
  inputFromMetadata,
} from "@/lib/result-sections";
import { clientIp, isYookassaAddress } from "@/lib/webhook-guard";
import { SITE_NAME } from "@/lib/site-name";

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
  const ip = clientIp(request);

  if (!isYookassaAddress(ip)) {
    console.warn("[webhook] Уведомление с неизвестного адреса отклонено", { ip });
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

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

    await deliverReading(metadata, payment.id ?? null);
  } else {
    console.log("[webhook] Событие без подтверждённой оплаты", {
      event: payload.event,
      paymentId: payment?.id,
      status: payment?.status,
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

/**
 * Защита от повторной отправки одного и того же расклада.
 *
 * ЮKassa повторяет уведомление, пока не получит 200, поэтому доставка,
 * завершившаяся после медленного ответа, ушла бы покупателю дважды. Множество
 * живёт в памяти инстанса и покрывает только повторы, попавшие на тот же
 * прогретый процесс — надёжное решение это запись заказа в базе, которой у
 * проекта пока нет.
 */
const delivered = new Set<string>();

async function deliverReading(
  metadata: Record<string, string>,
  paymentId: string | null
): Promise<void> {
  const key = paymentId ?? metadata.orderId ?? "";

  if (key && delivered.has(key)) {
    console.log("[webhook] Расклад уже отправлен, пропускаем", { paymentId });
    return;
  }

  const email = metadata.email;
  const input = inputFromMetadata(metadata);

  if (!email || !input) {
    console.error("[webhook] Недостаточно данных для отправки расклада", {
      paymentId,
      hasEmail: Boolean(email),
      hasInput: Boolean(input),
    });
    return;
  }

  try {
    const sections = generateResultSections(input, metadata.plan);

    const pdfBuffer = await generatePDF({
      title: "Ваш расклад Таро",
      userName: input.name,
      subtitle: buildSubtitle(input),
      sections,
      siteName: SITE_NAME,
    });

    await sendResultEmail({
      to: email,
      subject: "Ваш расклад Таро готов",
      userName: input.name,
      resultHtml: sections
        .map(
          (section) =>
            `<h3 style="color:#C8973A;font-size:17px;margin:24px 0 8px;">${section.title}</h3>` +
            `<p style="font-size:15px;line-height:1.6;margin:0;white-space:pre-line;">${section.content}</p>`
        )
        .join(""),
      pdfBuffer,
      fileName: "raskladtaro.pdf",
      siteName: SITE_NAME,
    });

    if (key) delivered.add(key);

    console.log("[webhook] Расклад отправлен", { paymentId, to: email });
  } catch (error) {
    // Ошибку намеренно не пробрасываем: ответ всё равно 200. Ответ не-200
    // заставит ЮKassa повторять уведомление часами, а сбой здесь относится к
    // доставке, а не к платежу — деньги уже приняты в любом случае.
    console.error("[webhook] Не удалось отправить расклад", {
      paymentId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
