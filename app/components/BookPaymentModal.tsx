"use client";

import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { stripePromise } from "@/lib/stripe";

const BG = "#080808";
const BLUE = "#1A6EFF";
const MUTED = "rgba(255,255,255,0.3)";
const BORDER = "0.5px solid rgba(255,255,255,0.1)";
const CARD_WRAP = {
  padding: "12px",
  border: BORDER,
  borderRadius: "11px",
  background: "rgba(255,255,255,0.05)",
  marginBottom: "14px",
};

const cardElementOptions = {
  style: {
    base: {
      color: "#ffffff",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "15px",
      "::placeholder": {
        color: "rgba(255,255,255,0.3)",
      },
    },
    invalid: {
      color: "#FF3B30",
    },
  },
};

function ConfirmPaymentForm({
  clientSecret,
  onPaid,
  onError,
}: {
  clientSecret: string;
  onPaid: () => void;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setProcessing(true);
    onError("");

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    });

    setProcessing(false);

    if (error) {
      onError(error.message ?? "payment failed");
      return;
    }
    if (paymentIntent?.status === "succeeded") {
      onPaid();
    } else {
      onError("payment was not completed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={CARD_WRAP}>
        <CardElement options={cardElementOptions} />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        style={{
          width: "100%",
          minHeight: "44px",
          borderRadius: "100px",
          border: "none",
          background: BLUE,
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 500,
          cursor: !stripe || processing ? "not-allowed" : "pointer",
          opacity: !stripe || processing ? 0.75 : 1,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
        }}
      >
        {processing && <span className="presence-spinner" aria-hidden />}
        {processing ? "processing..." : "confirm and pay"}
      </button>
    </form>
  );
}

export type BookPaymentModalProps = {
  open: boolean;
  onClose: () => void;
  flightPrice: number;
  convenienceFee: number;
  insuranceAmount: number;
  includeInsurance: boolean;
  total: number;
};

export function BookPaymentModal({
  open,
  onClose,
  flightPrice,
  convenienceFee,
  insuranceAmount,
  includeInsurance,
  total,
}: BookPaymentModalProps) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setClientSecret(null);
      setError("");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingIntent(true);
      setError("");
      setClientSecret(null);
      try {
        const res = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            flightPrice,
            includeInsurance,
          }),
        });
        const data = (await res.json()) as { clientSecret?: string; error?: string };
        if (!res.ok) {
          throw new Error(data.error ?? "could not start payment");
        }
        if (!data.clientSecret) {
          throw new Error("missing payment secret");
        }
        if (!cancelled) setClientSecret(data.clientSecret);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "something went wrong");
        }
      } finally {
        if (!cancelled) setLoadingIntent(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, flightPrice, includeInsurance]);

  if (!open) return null;

  return (
    <>
      <div
        role="presentation"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.55)",
          zIndex: 200,
        }}
        onClick={() => !loadingIntent && onClose()}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-sheet-title"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          maxHeight: "92vh",
          overflowY: "auto",
          background: BG,
          zIndex: 201,
          borderTop: BORDER,
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          padding: "16px 16px calc(20px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 id="payment-sheet-title" style={{ fontSize: "18px", fontWeight: 600, margin: 0, textTransform: "lowercase" }}>
            pay
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={loadingIntent}
            style={{
              border: "none",
              background: "transparent",
              color: MUTED,
              fontSize: "13px",
              cursor: loadingIntent ? "not-allowed" : "pointer",
              textTransform: "lowercase",
            }}
          >
            cancel
          </button>
        </div>

        <p style={{ fontSize: "11px", color: MUTED, marginBottom: "10px", textTransform: "lowercase" }}>price breakdown</p>
        <div style={{ marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)" }}>flight price</span>
            <span style={{ fontSize: "13px" }}>${flightPrice.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)" }}>convenience fee (8%)</span>
            <span style={{ fontSize: "13px" }}>${convenienceFee.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)" }}>trip insurance</span>
            <span style={{ fontSize: "13px", textDecoration: includeInsurance ? "none" : "line-through" }}>
              ${insuranceAmount.toFixed(2)}
            </span>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "15px", fontWeight: 600 }}>total</span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: BLUE }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {loadingIntent && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span className="presence-spinner" aria-hidden />
            <span style={{ fontSize: "13px", color: MUTED }}>preparing payment...</span>
          </div>
        )}

        {!!error && !loadingIntent && (
          <p style={{ color: "#FF3B30", fontSize: "12px", marginBottom: "12px", lineHeight: 1.4 }}>{error}</p>
        )}

        {clientSecret && !loadingIntent && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
                variables: {
                  colorPrimary: BLUE,
                },
              },
            }}
          >
            <ConfirmPaymentForm
              clientSecret={clientSecret}
              onPaid={() => router.push("/sms")}
              onError={setError}
            />
          </Elements>
        )}
      </aside>
    </>
  );
}
