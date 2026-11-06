/*
 * Guardar coisas no aparelho de quem visita — do jeito que não quebra.
 *
 * NUNCA use localStorage direto neste projeto: na prévia do editor a página
 * roda em origem opaca, onde ACESSAR localStorage lança SecurityError (até
 * `typeof localStorage` lança) e a tela fica branca. Aqui o acesso é sempre
 * embrulhado; quando o navegador recusa, cai numa memória volátil.
 */
const volatil = new Map<string, string>();

function cofre(): Storage | null {
  try {
    const s = window.localStorage;
    s.getItem("__t");
    return s;
  } catch {
    return null;
  }
}

export function ler<T>(chave: string, padrao: T): T {
  try {
    const c = cofre();
    const bruto = c ? c.getItem(chave) : volatil.get(chave);
    return bruto == null ? padrao : (JSON.parse(bruto) as T);
  } catch {
    return padrao;
  }
}

export function guardar(chave: string, valor: unknown): void {
  const bruto = JSON.stringify(valor);
  try {
    const c = cofre();
    if (c) c.setItem(chave, bruto);
    else volatil.set(chave, bruto);
  } catch {
    volatil.set(chave, bruto);
  }
}

export function apagar(chave: string): void {
  try {
    cofre()?.removeItem(chave);
  } catch {
    /* nada a fazer */
  }
  volatil.delete(chave);
}
