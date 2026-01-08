import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb";
import Locality from "@/models/Locality";

// Helper function to validate ID
const validateId = (id: string | undefined): number | null => {
  if (!id) return null;
  const numId = Number(id);
  // Check if it's a valid number and not NaN
  return !isNaN(numId) ? numId : null;
};

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = await req.json();
  console.log("PUT Body:", body);
  const localityId = validateId(id);

  if (localityId === null) return NextResponse.json({ message: "Invalid ID" }, { status: 400 });

  await connect();

  try {

    const updated = await Locality.findOneAndUpdate(
      { Id: localityId },
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT Database Error:", error);
    return NextResponse.json(
      { message: error.message || "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const localityId = validateId(id);

  if (localityId === null) {
    return NextResponse.json(
      { message: "Invalid Locality ID provided" },
      { status: 400 }
    );
  }

  await connect();

  await Locality.findOneAndDelete({ Id: localityId });

  return NextResponse.json({ success: true });
}
