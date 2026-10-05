import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, empresa, tipo_proyecto, mensaje } = body;

    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          nombre,
          email,
          telefono,
          empresa,
          tipo_proyecto,
          mensaje,
          estado: 'Nuevo',
        },
      ]);

    if (error) {
      console.error('Error de Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (err) {
    console.error('Error en el servidor:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}