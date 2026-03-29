import { NextRequest, NextResponse } from "next/server";
import { Duffel } from "@duffel/api";

const duffel = new Duffel({
  token: process.env.DUFFEL_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { origin, destination, date } = await req.json();

    if (!origin || !destination || !date) {
      return NextResponse.json(
        { error: "missing required fields: origin, destination, date" },
        { status: 400 }
      );
    }

    if (!process.env.DUFFEL_API_KEY) {
      console.error("missing DUFFEL_API_KEY env var");
      return NextResponse.json(
        { error: "flight search not configured" },
        { status: 500 }
      );
    }

    const offerRequest = await duffel.offerRequests.create({
      slices: [
        {
          origin: String(origin),
          destination: String(destination),
          departure_date: String(date),
        } as any,
      ],
      passengers: [{ type: "adult" as const }],
      cabin_class: "economy" as const,
    });

    const offers = await duffel.offers.list({
      offer_request_id: offerRequest.data.id,
      sort: "total_amount",
      limit: 10,
    });

    const offerList = offers.data ?? [];

    if (offerList.length === 0) {
      return NextResponse.json(
        { error: "no flights found for this route and date. try different airports or a different date." },
        { status: 404 }
      );
    }

    return NextResponse.json({ offers: offerList }, { status: 200 });
  } catch (error: unknown) {
    console.error("duffel error:", error);

    const duffelError = error as {
      message?: string;
      errors?: { message: string }[];
    };

    const message =
      duffelError?.errors?.[0]?.message ??
      duffelError?.message ??
      "unknown error";

    return NextResponse.json(
      { error: "flight search failed", details: message },
      { status: 500 }
    );
  }
}