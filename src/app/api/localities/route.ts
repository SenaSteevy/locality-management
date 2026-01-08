import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb";
import Locality from "@/models/Locality";

export async function GET(req: Request) {
    try {
        await connect();

        const { searchParams } = new URL(req.url);
        const region = searchParams.get("region");
        const department = searchParams.get("department");
        const q = searchParams.get("q");

        const filter: any = {};

        if (region) {
            const numRegion = Number(region);
            if (isNaN(numRegion)) {
                return NextResponse.json({ message: "Invalid Region ID format." }, { status: 400 });
            }
            filter.RegionStructureTypeId = numRegion;
        }

        if (department) {
            const numDepartment = Number(department);
            if (isNaN(numDepartment)) {
                return NextResponse.json({ message: "Invalid Department ID format." }, { status: 400 });
            }
            filter.ParentRegionStructureId = numDepartment;
        }

        if (q) filter.Name = { $regex: q, $options: "i" };

        const data = await Locality.find(filter).lean();

        return NextResponse.json(data);
    } catch (error) {
        console.error("GET Locality error:", error);
        return NextResponse.json(
            { message: "Internal Server Error during data fetching.", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function POST(req: Request) {
    try {
        await connect();
        const body = await req.json();

        const payload = Array.isArray(body) ? body : [body];
        console.log("POST Locality payload:", payload);

        // Ensure payload is not empty
        if (payload.length === 0) {
             return NextResponse.json({ message: "Payload cannot be empty." }, { status: 400 });
        }

        const created = await Locality.insertMany(payload, { ordered: false });
        return NextResponse.json(created, { status: 201 });
    } catch (error) {
        // Handle common MongoDB error codes (e.g., 11000 for duplicate key)
        if (error && (error as any).code === 11000) {
             return NextResponse.json({ message: "Duplicate key error: A locality with this Code or ID already exists." }, { status: 409 });
        }
        
        console.error("POST Locality error:", error);
        return NextResponse.json(
            { message: "Internal Server Error during data creation.", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}