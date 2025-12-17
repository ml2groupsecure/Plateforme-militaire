import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Créer les tables si elles n'existent pas
    const createTablesSQL = `
      -- Table des utilisateurs
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'agent' CHECK (role IN ('admin', 'agent')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      );

      -- Table des incidents criminels
      CREATE TABLE IF NOT EXISTS incidents (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type VARCHAR(100) NOT NULL,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        severity VARCHAR(50) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
        reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        resolved_at TIMESTAMP WITH TIME ZONE,
        assigned_agent_id UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table des suspects
      CREATE TABLE IF NOT EXISTS suspects (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        gender VARCHAR(20),
        description TEXT,
        risk_level VARCHAR(50) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
        status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'arrested', 'cleared')),
        last_known_location VARCHAR(255),
        photo_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table des ressources
      CREATE TABLE IF NOT EXISTS resources (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        type VARCHAR(50) NOT NULL CHECK (type IN ('personnel', 'vehicle', 'equipment')),
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'maintenance', 'offline')),
        location VARCHAR(255),
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        assigned_to UUID REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Table des fichiers CSV
      CREATE TABLE IF NOT EXISTS csv_uploads (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_rows INTEGER NOT NULL,
        processed_rows INTEGER NOT NULL,
        duplicates_removed INTEGER DEFAULT 0,
        errors_count INTEGER DEFAULT 0,
        upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        uploaded_by UUID REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'processed' CHECK (status IN ('processing', 'processed', 'error')),
        file_data JSONB
      );

      -- Table des notifications
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
        priority VARCHAR(50) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        user_id UUID REFERENCES users(id),
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Exécuter la création des tables
    const { error: createError } = await supabaseClient.rpc('exec_sql', {
      sql: createTablesSQL
    });

    if (createError) {
      console.error('Erreur création tables:', createError);
    }

    // Insérer des données de test
    const testUsers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@seenpredyct.sn',
        name: 'Amadou Diallo',
        role: 'admin',
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'agent1@seenpredyct.sn',
        name: 'Fatou Sall',
        role: 'agent',
        status: 'active'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        email: 'agent2@seenpredyct.sn',
        name: 'Moussa Ba',
        role: 'agent',
        status: 'active'
      }
    ];

    // Insérer les utilisateurs de test
    for (const user of testUsers) {
      const { error } = await supabaseClient
        .from('users')
        .upsert(user, { onConflict: 'email' });
      
      if (error) {
        console.error('Erreur insertion utilisateur:', error);
      }
    }

    // Insérer des incidents de test
    const testIncidents = [
      {
        type: 'Vol à main armée',
        description: 'Vol dans une boutique de Sandaga',
        location: 'Marché Sandaga, Dakar',
        latitude: 14.6937,
        longitude: -17.4441,
        severity: 'high',
        status: 'investigating',
        assigned_agent_id: '550e8400-e29b-41d4-a716-446655440002'
      },
      {
        type: 'Agression',
        description: 'Agression nocturne près de la corniche',
        location: 'Corniche Ouest, Dakar',
        latitude: 14.7167,
        longitude: -17.4677,
        severity: 'medium',
        status: 'open',
        assigned_agent_id: '550e8400-e29b-41d4-a716-446655440003'
      }
    ];

    const { error: incidentsError } = await supabaseClient
      .from('incidents')
      .upsert(testIncidents);

    if (incidentsError) {
      console.error('Erreur insertion incidents:', incidentsError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Base de données initialisée avec succès' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})