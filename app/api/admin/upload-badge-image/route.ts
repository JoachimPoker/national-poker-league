import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BUCKET_NAME = 'badge-images'

export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed: PNG, JPG, WEBP, GIF, SVG' 
      }, { status: 400 })
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 2MB' 
      }, { status: 400 })
    }

    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `badge-${timestamp}-${random}.${extension}`
    const filepath = `badges/${filename}`

    const arrayBuffer = await file.arrayBuffer()

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filepath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Supabase upload error:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to upload to Supabase Storage' 
      }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filepath)

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: filename,
      path: filepath
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to upload image' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const { searchParams } = new URL(request.url)
    const filepath = searchParams.get('filepath')

    if (!filepath) {
      return NextResponse.json({ error: 'Filepath required' }, { status: 400 })
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filepath])

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to delete image' 
      }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to delete image' 
    }, { status: 500 })
  }
}