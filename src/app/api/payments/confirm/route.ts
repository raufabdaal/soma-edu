import { NextRequest, NextResponse } from "next/server";
import { doc, updateDoc, Timestamp, addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, plan, paymentRef, adminKey } = body;

    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expiry = new Date();
    if (plan === "monthly") expiry.setDate(expiry.getDate() + 30);
    else expiry.setDate(expiry.getDate() + 90);

    await updateDoc(doc(db, "students", studentId), {
      subscriptionStatus: 'active',
      subscriptionExpiry: Timestamp.fromDate(expiry),
    });

    await addDoc(collection(db, "payments"), {
      studentId, plan, paymentRef, timestamp: Timestamp.now(), status: "confirmed"
    });

    return NextResponse.json({ success: true, expiry: expiry.toISOString() });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
