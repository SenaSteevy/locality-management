// app/api/localities/delete/route.ts
import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb";
import Locality from "@/models/Locality";

export async function DELETE(req: Request) {
  try {
    await connect();
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { message: "Invalid request: 'ids' array is required." },
        { status: 400 }
      );
    }

    // Deletes all documents whose 'Id' is in the provided array
    const result = await Locality.deleteMany({
      Id: { $in: ids }
    });

    return NextResponse.json({
      message: "Success",
      deletedCount: result.deletedCount
    });

  } catch (error: any) {
    console.error("Bulk Delete Error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to delete localities." },
      { status: 500 }
    );
  }
}