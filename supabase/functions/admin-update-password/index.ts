
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Secure logger for edge function
const secureLog = {
  info: (message: string, data?: any) => {
    const maskedData = data ? maskSensitiveData(data) : undefined;
    console.log(`[INFO] ${message}`, maskedData || '');
  },
  error: (message: string, data?: any) => {
    const maskedData = data ? maskSensitiveData(data) : undefined;
    console.error(`[ERROR] ${message}`, maskedData || '');
  },
  warn: (message: string, data?: any) => {
    const maskedData = data ? maskSensitiveData(data) : undefined;
    console.warn(`[WARN] ${message}`, maskedData || '');
  }
};

const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveFields = ['password', 'email', 'token', 'key', 'secret'];
  const masked = { ...data };
  
  Object.keys(masked).forEach(key => {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveFields.some(field => lowerKey.includes(field));

    if (isSensitive && typeof masked[key] === 'string') {
      if (key.toLowerCase().includes('email')) {
        const email = masked[key];
        if (email.includes('@')) {
          const [user, domain] = email.split('@');
          masked[key] = `${user[0]}***${user[user.length - 1]}@***`;
        } else {
          masked[key] = '***';
        }
      } else {
        masked[key] = '***';
      }
    } else if (typeof masked[key] === 'object') {
      masked[key] = maskSensitiveData(masked[key]);
    }
  });

  return masked;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create supabase client with service role (for admin operations)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client to verify the requesting user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    // Verify the requesting user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user has admin role
    const { data: hasAdminRole, error: roleError } = await supabaseAdmin
      .rpc('has_role', { _user_id: user.id, _role: 'admin' })

    if (roleError || !hasAdminRole) {
      throw new Error('Insufficient permissions - admin role required')
    }

    // Get request body
    const { targetUserId, newPassword, username } = await req.json()

    if (!targetUserId || !newPassword || !username) {
      throw new Error('Missing required fields: targetUserId, newPassword, username')
    }

    // Validate password requirements
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long')
    }

    secureLog.info('Admin password update initiated', { 
      adminId: user.id,
      targetUserId,
      username
    });

    // Update user password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    )

    if (updateError) {
      secureLog.error('Error updating password', { error: updateError.message });
      throw updateError
    }

    // Log the admin action
    const { error: logError } = await supabaseAdmin
      .from('admin_actions')
      .insert({
        admin_id: user.id,
        target_user_id: targetUserId,
        action_type: 'password_change',
        details: {
          username: username,
          changed_at: new Date().toISOString(),
          status: 'completed'
        }
      })

    if (logError) {
      secureLog.warn('Failed to log admin action', { error: logError.message });
    }

    secureLog.info('Password update completed successfully', { 
      targetUserId,
      username
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Password updated successfully for ${username}` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    secureLog.error('Error in admin-update-password function', { error: error.message });
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
