// app/api/localities/import/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb";
import Locality from "@/models/Locality";

export async function POST(req: Request) {
  try {
    await connect();
    const data = await req.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Expected an array" }, { status: 400 });
    }

    const operations = data.map((item) => ({
      replaceOne: {
        // FIX: Filter by EITHER Id or Code to prevent index clashes
        filter: { 
          $or: [
            { Id: item.Id },
            { Code: item.Code },
            { CodeNumber: item.CodeNumber }
          ] 
        },
        replacement: item,
        upsert: true,
      },
    }));

    const result = await Locality.bulkWrite(operations, { ordered: false });

    return NextResponse.json({
      success: true,
      insertedCount: result.upsertedCount,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}