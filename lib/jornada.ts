import { useSyncExternalStore } from "react";
import { ETAPAS, type EtapaId } from "@/data/etapas";
import type { Modelo } from "@/data/modelos";
import { ler, guardar } from "@/lib/guardar";

export type Modo = "guiado" | "quadro" | "ia" | "modelo";

export type Cartao = { texto: string; canal: string; emocao: number };

export type TipoDor = "Necessidade" | "Dor" | "Objeção" | "Obstáculo" | "Desejo";
export type Intensidade = "Alta" | "Média" | "Baixa";

/* Uma linha da tabela de dores: o que o herói sente, quem é atingido e como a marca responde. */
export type Dor = {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoDor;
  intensidade: Intensidade;
  etapa: EtapaId;
  publico: string;
  solucao: string;
  mensagem: string;
};

/* Cada persona é um herói diferente vivendo a mesma marca, com as próprias 8 etapas. */
export type Persona = {
  id: string;
  /* Nome dado pela pessoa; vazio = usa o começo da descrição do herói. */
  nome?: string;
  heroi: string;
  transformacao: string;
  ordem: EtapaId[];
  cartoes: Record<EtapaId, Cartao>;
  /* Público atingido e tabela de dores; undefined = ainda não montada. */
  publico?: string;
  dores?: Dor[];
};

/* heroi/transformacao/ordem/cartoes no topo espelham a persona ativa: os modos editam só ela. */
export type Jornada = {
  nome: string;
  marca: string;
  heroi: string;
  transformacao: string;
  modo: Modo;
  ordem: EtapaId[];
  cartoes: Record<EtapaId, Cartao>;
  personas: Persona[];
  ativa: string;
  atualizadoEm: number;
};

const CHAVE = "odisseia:jornada";

export const CORES_PERSONA = ["var(--primary)", "var(--ouro)", "var(--chart-4)", "var(--success)", "var(--chart-3)"];

export const novoId = () => Math.random().toString(36).slice(2, 9);

function cartoesVazios() {
  return Object.fromEntries(
    ETAPAS.map((e) => [e.id, { texto: "", canal: e.canalSugerido, emocao: e.emocaoTipica }]),
  ) as Record<EtapaId, Cartao>;
}

function personaVazia(heroi = ""): Persona {
  return { id: novoId(), heroi, transformacao: "", ordem: ETAPAS.map((e) => e.id), cartoes: cartoesVazios() };
}

const daPersona = (p: Omit<Persona, "id">) => ({ heroi: p.heroi, transformacao: p.transformacao, ordem: p.ordem, cartoes: p.cartoes });

export function novaJornada(modo: Modo = "guiado"): Jornada {
  const p = personaVazia();
  return { nome: "Minha jornada", marca: "", modo, ...daPersona(p), personas: [p], ativa: p.id, atualizadoEm: 0 };
}

export function jornadaDoModelo(m: Modelo): Jornada {
  const p: Persona = { ...personaVazia(m.heroi), transformacao: m.transformacao, cartoes: structuredClone(m.cartoes) };
  return {
    ...novaJornada("modelo"),
    nome: `Jornada — ${m.marca}`,
    marca: m.marca,
    ...daPersona(p),
    personas: [p],
    ativa: p.id,
    atualizadoEm: Date.now(),
  };
}

/* Jornada de exemplo já com várias personas (usada na página inicial). */
export function jornadaComPersonas(marca: string, lista: { nome: string; heroi: string; transformacao: string; cartoes: Persona["cartoes"] }[]): Jornada {
  const personas: Persona[] = lista.map((x) => ({ ...personaVazia(x.heroi), nome: x.nome, transformacao: x.transformacao, cartoes: structuredClone(x.cartoes) }));
  return { ...novaJornada("quadro"), nome: `Jornada — ${marca}`, marca, ...daPersona(personas[0]), personas, ativa: personas[0].id, atualizadoEm: Date.now() };
}

export function nomePersona(p: { heroi: string; nome?: string }, i: number) {
  return p.nome?.trim() || p.heroi.split(",")[0].trim() || `Persona ${i + 1}`;
}

/* Rascunho da jornada fica no aparelho, compartilhado entre os três modos. */
let atual: Jornada = normalizar(ler<Jornada | null>(CHAVE, null));
const ouvintes = new Set<() => void>();

function normalizarPersona(p: Partial<Persona>): Persona {
  const base = personaVazia();
  const ordem = Array.isArray(p.ordem) && p.ordem.length === ETAPAS.length ? p.ordem : base.ordem;
  const dores = Array.isArray(p.dores) ? p.dores : undefined;
  return { ...base, ...p, id: p.id || base.id, ordem, cartoes: { ...base.cartoes, ...p.cartoes }, dores };
}

function normalizar(j: Jornada | null): Jornada {
  const base = novaJornada();
  if (!j || !j.cartoes) return base;
  /* Jornadas antigas (uma persona só) viram a primeira persona. */
  let personas = Array.isArray(j.personas) && j.personas.length ? j.personas.map(normalizarPersona) : [normalizarPersona(j)];
  const ativa = personas.some((p) => p.id === j.ativa) ? j.ativa : personas[0].id;
  personas = personas.map((p) => (p.id === ativa ? normalizarPersona({ ...p, ...daPersona(normalizarPersona(j)) }) : p));
  const p = personas.find((x) => x.id === ativa)!;
  return { ...base, ...j, ...daPersona(p), personas, ativa };
}

export function useJornada() {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => atual,
    () => atual,
  );
}

export function salvarJornada(mudar: Jornada | ((j: Jornada) => Jornada)) {
  const prox = typeof mudar === "function" ? mudar(atual) : mudar;
  const personas = prox.personas.map((p) => (p.id === prox.ativa ? { ...p, ...daPersona(prox) } : p));
  atual = { ...prox, personas, atualizadoEm: Date.now() };
  guardar(CHAVE, atual);
  ouvintes.forEach((f) => f());
}

function ativar(j: Jornada, personas: Persona[], id: string): Jornada {
  const p = personas.find((x) => x.id === id)!;
  return { ...j, ...daPersona(p), personas, ativa: id };
}

export function trocarPersona(id: string) {
  salvarJornada((j) => ativar(j, j.personas, id));
}

export function adicionarPersona(copiarDe?: string) {
  salvarJornada((j) => {
    const origem = copiarDe ? j.personas.find((p) => p.id === copiarDe) : undefined;
    const nova: Persona = origem
      ? {
          ...structuredClone(origem),
          id: novoId(),
          nome: origem.nome?.trim() ? `${origem.nome.trim()} (variação)` : "",
          heroi: origem.heroi && !origem.nome?.trim() ? `${nomePersona(origem, 0)} (variação)` : origem.heroi,
        }
      : personaVazia();
    return ativar(j, [...j.personas, nova], nova.id);
  });
}

export function renomearPersona(id: string, nome: string) {
  salvarJornada((j) => ({ ...j, personas: j.personas.map((p) => (p.id === id ? { ...p, nome: nome.trim().slice(0, 40) } : p)) }));
}

export function removerPersona(id: string) {
  salvarJornada((j) => {
    if (j.personas.length < 2) return j;
    const i = j.personas.findIndex((p) => p.id === id);
    const personas = j.personas.filter((p) => p.id !== id);
    const ativa = j.ativa === id ? personas[Math.max(0, i - 1)].id : j.ativa;
    return ativar(j, personas, ativa);
  });
}

/* Público e tabela de dores ficam só na persona (não espelham no topo da jornada). */
export function mudarPersona(id: string, patch: Pick<Partial<Persona>, "publico" | "dores">) {
  salvarJornada((j) => ({ ...j, personas: j.personas.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));
}

export function mudarCartao(id: EtapaId, patch: Partial<Cartao>) {
  salvarJornada((j) => ({ ...j, cartoes: { ...j.cartoes, [id]: { ...j.cartoes[id], ...patch } } }));
}

/* Edita a etapa de qualquer persona, sem trocar a ativa (usado na comparação lado a lado). */
export function mudarCartaoDe(personaId: string, id: EtapaId, patch: Partial<Cartao>) {
  salvarJornada((j) => {
    if (personaId === j.ativa) return { ...j, cartoes: { ...j.cartoes, [id]: { ...j.cartoes[id], ...patch } } };
    return {
      ...j,
      personas: j.personas.map((p) => (p.id === personaId ? { ...p, cartoes: { ...p.cartoes, [id]: { ...p.cartoes[id], ...patch } } } : p)),
    };
  });
}

export function progresso(j: Jornada) {
  const feitas = j.ordem.filter((id) => j.cartoes[id]?.texto.trim().length > 0).length;
  return { feitas, total: j.ordem.length, pct: Math.round((feitas / j.ordem.length) * 100) };
}

export function horaSalva(j: Jornada) {
  if (!j.atualizadoEm) return "Rascunho novo";
  const d = new Date(j.atualizadoEm);
  return `Salvo às ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

/* Link compartilhável: a jornada viaja no próprio endereço. */
export function codificar(j: Jornada) {
  const bytes = new TextEncoder().encode(JSON.stringify(j));
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodificar(s: string): Jornada | null {
  try {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b64);
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
    return normalizar(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return null;
  }
}

export function comoTexto(j: Jornada) {
  const linhas = [`${j.nome}`, "", `Marca: ${j.marca || "—"}`, `Personas: ${j.personas.length}`, ""];
  j.personas.forEach((p, n) => {
    linhas.push(`=== Persona ${n + 1}: ${nomePersona(p, n)} ===`, `Herói: ${p.heroi || "—"}`, `Transformação: ${p.transformacao || "—"}`, "");
    p.ordem.forEach((id, i) => {
      const e = ETAPAS.find((x) => x.id === id)!;
      const c = p.cartoes[id];
      linhas.push(`${i + 1}. ${e.nome} — ${e.papel}`, c.texto || "(em branco)", `Canal: ${c.canal}`, "");
    });
    if (p.dores?.length) {
      linhas.push("--- Dores e necessidades ---", `Público atingido: ${p.publico?.trim() || p.heroi || "—"}`, "");
      p.dores.forEach((d) => {
        linhas.push(
          `• ${d.titulo || d.tipo} (${d.tipo}, intensidade ${d.intensidade}, etapa ${ETAPAS.find((x) => x.id === d.etapa)?.nome ?? "—"})`,
          `  Como aparece: ${d.descricao || "—"}`,
          `  Público: ${d.publico || "—"}`,
          `  Como a marca atende: ${d.solucao || "—"}`,
          `  Mensagem-chave: ${d.mensagem || "—"}`,
          "",
        );
      });
    }
  });
  return linhas.join("\n");
}

export type EntradaGerador = {
  marca: string;
  produto: string;
  heroi: string;
  problema: string;
  objecao: string;
  transformacao: string;
  primeiroPasso: string;
};

/* Assistente que monta a narrativa a partir das respostas, etapa por etapa. */
export function gerarJornada(e: EntradaGerador): Jornada {
  const heroi = e.heroi.trim() || "o seu cliente";
  const marca = e.marca.trim() || "a sua marca";
  const produto = e.produto.trim() || "a sua solução";
  const problema = e.problema.trim() || "um problema que não para de crescer";
  const objecao = e.objecao.trim() || "medo de gastar tempo e dinheiro sem resultado";
  const transf = e.transformacao.trim() || "alcançar o resultado que sempre quis";
  const passo = e.primeiroPasso.trim() || "um teste gratuito";
  const H = heroi.charAt(0).toUpperCase() + heroi.slice(1);

  const textos: Record<EtapaId, string> = {
    "mundo-comum": `${H} segue a rotina de sempre, convivendo com ${problema.toLowerCase()} como se fosse normal. Funciona, mas custa energia todos os dias.`,
    chamado: `Um dia, ${problema.toLowerCase()} pesa mais do que o normal: um prazo perdido, um resultado abaixo da meta. ${H} percebe que precisa mudar agora.`,
    recusa: `Mesmo assim, hesita. A principal trava é ${objecao.toLowerCase()}. Sem uma resposta clara para isso, a decisão fica para depois.`,
    mentor: `${marca} aparece mostrando que entende exatamente essa situação. Com ${produto.toLowerCase()}, apresenta casos parecidos e um caminho simples para ${transf.toLowerCase()}.`,
    limiar: `${H} dá o primeiro passo com ${passo.toLowerCase()}: baixo risco, começo rápido e um plano claro do que acontece em seguida.`,
    provacoes: `Nos primeiros dias surgem dúvidas e pequenas travas. ${marca} está por perto com suporte ágil, tutoriais e acompanhamento para ninguém desistir no meio.`,
    recompensa: `O resultado chega: ${transf.toLowerCase()}. ${H} sente a diferença no dia a dia e tem números para mostrar.`,
    retorno: `${H} conta a conquista para colegas e amigos, deixa um depoimento e indica ${marca}. A história inspira o próximo herói.`,
  };

  const base = novaJornada("ia");
  return {
    ...base,
    nome: `Jornada — ${marca}`,
    marca,
    heroi,
    transformacao: transf,
    cartoes: Object.fromEntries(
      ETAPAS.map((et) => [et.id, { ...base.cartoes[et.id], texto: textos[et.id] }]),
    ) as Record<EtapaId, Cartao>,
    atualizadoEm: Date.now(),
  };
}
