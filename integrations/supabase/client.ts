// Arquivo da PLATAFORMA — não edite. Uso: import { supabase } from "@/integrations/supabase/client";
//
// As credenciais não ficam aqui: a plataforma injeta em toda página servida,
// antes de qualquer script. `supabase` é null enquanto o projeto não tem banco
// ligado — cheque antes de consultar, para a tela mostrar um aviso em vez de
// estourar na carga do módulo.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type Janela = Window & {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  LZ_SUPABASE?: { url?: string; anon?: string };
};

function credenciais() {
  const g = (typeof window === "undefined" ? {} : window) as Janela;
  const url = g.SUPABASE_URL || g.LZ_SUPABASE?.url || "";
  const chave = g.SUPABASE_ANON_KEY || g.LZ_SUPABASE?.anon || "";
  return url && chave ? { url, chave } : null;
}

function temArmazenamento() {
  try {
    window.localStorage.getItem("__t");
    return true;
  } catch {
    return false;
  }
}

const c = credenciais();

export const supabase: SupabaseClient | null = c
  ? createClient(c.url, c.chave, {
      auth: {
        // Na prévia (origem opaca) localStorage lança: sem isto o cliente estoura ao nascer.
        persistSession: temArmazenamento(),
        autoRefreshToken: temArmazenamento(),
      },
    })
  : null;

/** Há banco ligado neste projeto? Use antes de qualquer consulta. */
export function temBanco(): boolean {
  return supabase !== null;
}
