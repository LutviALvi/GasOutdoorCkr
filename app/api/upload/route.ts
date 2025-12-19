import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    // 1. Convert File to ArrayBuffer/Buffer for upload
    const buffer = await file.arrayBuffer()
    const fileBody = new Uint8Array(buffer)

    // 2. Try Upload
    let { error: uploadError } = await supabaseAdmin.storage
        .from('products')
        .upload(filePath, fileBody, {
            contentType: file.type,
            upsert: false
        })

    // 3. Handle Bucket Not Found -> Create Bucket & Retry
    if (uploadError && uploadError.message.includes("Bucket not found")) {
        console.log("Bucket 'products' not found. Creating...")
        
        const { error: createError } = await supabaseAdmin.storage.createBucket('products', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/jpg']
        })

        if (createError) {
             console.error("Failed to create bucket:", createError)
             return NextResponse.json({ error: "Failed to create storage bucket" }, { status: 500 })
        }

        // Retry Upload
        const { error: retryError } = await supabaseAdmin.storage
            .from('products')
            .upload(filePath, fileBody, {
                contentType: file.type,
                upsert: false
            })
        
        if (retryError) uploadError = retryError
        else uploadError = null
    }

    if (uploadError) {
        throw uploadError
    }

    // 4. Get Public URL
    const { data } = supabaseAdmin.storage
        .from('products')
        .getPublicUrl(filePath)

    return NextResponse.json({ url: data.publicUrl })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 })
  }
}
