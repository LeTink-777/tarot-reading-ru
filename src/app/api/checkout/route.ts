import { NextResponse } from "next/server";
import { PLANS, isPlanId } from "@/lib/plans";
import { createPayment, isYukassaConfigured } from "@/lib/yukassa";
import { resolveSiteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutBody {
  plan?: unknown;
  userData?: {
    name?: unknown;
    email?: unknown;
    topic?: unknown;
  };
}

export async function POST(request: Request) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  if (!isPlanId(body.plan)) {
    return NextResponse.json({ error: "Неизвестный тариф" }, { status: 400 });
  }

  const plan = PLANS[body.plan];
  const name = typeof body.userData?.name === "string" ? body.userData.name.trim() : "";
  const email = typeof body.userData?.email === "string" ? body.userData.email.trim() : "";
  const topic = typeof body.userData?.topic === "string" ? body.userData.topic : "";

  if (!email) {
    return NextResponse.json({ error: "Не указан email" }, { status: 400 });
  }

  if (!isYukassaConfigured()) {
    return NextResponse.json(
      { error: "Оплата временно недоступна. Попробуйте позже." },
      { status: 503 },
    );
  }

  const orderId = `tarot-${plan.id}-${Date.now().toString(36)}`;
  const base = resolveSiteUrl(request);
  const returnUrl = `${base}/thank-you?plan=${plan.id}&order=${orderId}`;

  try {
    const payment = await createPayment(plan.price, orderId, plan.description, returnUrl, {
      plan: plan.id,
      email,
      name: name.slice(0, 120),
      topic: String(topic).slice(0, 60),
    });

    return NextResponse.json({
      orderId,
      paymentId: payment.paymentId,
      confirmationUrl: payment.confirmationUrl,
    });
  } catch (error) {
    console.error("[checkout] Не удалось создать платёж", error);
    return NextResponse.json(
      { error: "Не удалось создать платёж. Попробуйте ещё раз." },
      { status: 502 },
    );
  }
}
