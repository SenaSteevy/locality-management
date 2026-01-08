import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb";
import Locality from "@/models/Locality";

export async function POST(req: Request) {
  await connect();
  const { ids } = await req.json();

  const data = await Locality.find({ Id: { $in: ids } }).lean();

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": "attachment; filename=localities.json"
    }
  });
}
