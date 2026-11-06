import { ETAPA_POR_ID, EMOCOES, type EtapaId } from "@/data/etapas";
import { nomePersona, novoId, type Dor, type Intensidade, type Jornada, type Persona, type TipoDor } from "@/lib/jornada";

export const TIPOS_DOR: TipoDor[] = ["Necessidade", "Dor", "Objeção", "Obstáculo", "Desejo"];
export const INTENSIDADES: Intensidade[] = ["Alta", "Média", "Baixa"];

const primeiraFrase = (t: string, max = 220) => {
  const s = t.trim().split(/(?<=[.!?])\s/)[0] ?? "";
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
};

export function dorVazia(etapa: EtapaId = "chamado"): Dor {
  return { id: novoId(), titulo: "", descricao: "", tipo: "Dor", intensidade: "Média", etapa, publico: "", solucao: "", mensagem: "" };
}

/* Primeira versão da tabela, tirada das etapas da jornada. Tudo editável depois. */
export function sugerirDores(j: Jornada, p: Persona): Dor[] {
  const marca = j.marca.trim() || "a marca";
  const transf = p.transformacao.trim() || "chegar ao resultado que deseja";
  const publico = p.publico?.trim() || p.heroi.trim();
  const texto = (id: EtapaId) => primeiraFrase(p.cartoes[id].texto) || ETAPA_POR_ID[id].dica;
  const ajuda = primeiraFrase(p.cartoes.mentor.texto) || `${marca} mostra um caminho simples e seguro.`;
  const linha = (tipo: TipoDor, etapa: EtapaId, titulo: string, intensidade: Intensidade, solucao: string, mensagem: string): Dor => ({
    id: novoId(), tipo, etapa, titulo, intensidade, descricao: texto(etapa), publico, solucao, mensagem,
  });
  return [
    linha("Necessidade", "mundo-comum", "O que falta no dia a dia", "Média", ajuda, `Seu dia a dia não precisa ser tão pesado.`),
    linha("Dor", "chamado", "O gatilho que dói", "Alta", ajuda, `Chegou a hora de mudar — e você não precisa fazer isso sozinho.`),
    linha("Objeção", "recusa", "O medo que trava a decisão", "Alta", primeiraFrase(p.cartoes.limiar.texto) || "Primeiro passo pequeno, sem risco e com garantia.", `Comece pequeno: sem risco, com alguém ao seu lado.`),
    linha("Obstáculo", "provacoes", "A trava no começo", "Média", primeiraFrase(p.cartoes.provacoes.texto) || "Suporte rápido e acompanhamento de perto.", `Travou? A gente resolve junto, rápido.`),
    linha("Desejo", "recompensa", "A transformação sonhada", "Alta", primeiraFrase(p.cartoes.recompensa.texto) || transf, `Imagine ${transf.toLowerCase()}. É para lá que vamos.`),
  ];
}

export type Formato = "narrativa" | "textos" | "imagens" | "reels" | "abordagem" | "carrossel";

export const FORMATOS: { id: Formato; nome: string; resumo: string }[] = [
  { id: "narrativa", nome: "Storytelling", resumo: "A história completa em 3 tamanhos, com a marca como mentora." },
  { id: "textos", nome: "Textos", resumo: "Legendas, headlines de anúncio, e-mail e texto de página de vendas." },
  { id: "imagens", nome: "Imagens", resumo: "Cenas das etapas descritas para gerar imagens com IA." },
  { id: "reels", nome: "Reels", resumo: "Roteiros curtos com gancho, cenas, texto na tela e chamada." },
  { id: "abordagem", nome: "Abordagem", resumo: "Mensagens de primeiro contato, follow-up e respostas às objeções." },
  { id: "carrossel", nome: "Carrossel", resumo: "Carrosséis slide a slide, da capa com gancho à chamada final." },
];

export const TONS = ["Inspirador", "Próximo e informal", "Profissional e consultivo", "Provocativo", "Divertido"];
export const PLATAFORMAS = ["Instagram", "TikTok", "LinkedIn", "Facebook", "YouTube Shorts"];

export type Opcoes = { tom: string; plataforma: string; dorId: string | "todas" };

function contexto(j: Jornada, p: Persona, i: number, dores: Dor[]) {
  const emocao = (v: number) => EMOCOES.find((e) => e.valor === v)?.rotulo ?? "Neutro";
  const etapas = p.ordem.map((id, n) => {
    const e = ETAPA_POR_ID[id];
    const c = p.cartoes[id];
    return `${n + 1}. ${e.nome} (${e.papel}) — canal: ${c.canal}; o herói se sente: ${emocao(c.emocao)}\n   ${c.texto.trim() || "(etapa ainda não escrita: use o papel da etapa como guia)"}`;
  });
  const tabela = dores.length
    ? dores.map((d) => `- [${d.tipo} · intensidade ${d.intensidade} · etapa ${ETAPA_POR_ID[d.etapa].nome}] ${d.titulo || d.tipo}\n  Como aparece: ${d.descricao || "—"}\n  Quem sente: ${d.publico || "—"}\n  Como a marca atende: ${d.solucao || "—"}\n  Mensagem-chave: ${d.mensagem || "—"}`)
    : ["(tabela de dores ainda vazia: deduza as dores pela jornada)"];
  return [
    "## CONTEXTO",
    `Marca (a mentora, nunca a heroína): ${j.marca.trim() || "—"}`,
    `Herói / persona: ${nomePersona(p, i)} — ${p.heroi.trim() || "—"}`,
    `Público atingido: ${p.publico?.trim() || p.heroi.trim() || "—"}`,
    `Transformação prometida: ${p.transformacao.trim() || "—"}`,
    "",
    "## JORNADA DO HERÓI DESTE CLIENTE",
    ...etapas,
    "",
    "## DORES E NECESSIDADES QUE O CONTEÚDO PRECISA ATINGIR",
    ...tabela,
  ].join("\n");
}

const TAREFAS: Record<Formato, (o: Opcoes) => string> = {
  narrativa: (o) => `## TAREFA
Escreva o storytelling desta jornada no tom ${o.tom.toLowerCase()}, em português do Brasil.
Entregue 3 versões:
1. Curta (até 80 palavras) — para bio, anúncio ou abertura de apresentação.
2. Média (cerca de 250 palavras) — para post, e-mail ou página "sobre".
3. Longa (cerca de 600 palavras) — para blog ou roteiro de vídeo.
Regras:
- O cliente é o herói; a marca entra como mentora no momento do "Encontro com o mentor".
- Siga a ordem da jornada e mostre a virada emocional (do sentimento mais baixo ao mais alto).
- Use as palavras do próprio cliente para nomear a dor; evite jargão de marketing.
- Termine com um convite claro para o primeiro passo.
Depois das versões, liste 5 frases de efeito tiradas da história para usar como headline.`,

  textos: (o) => `## TAREFA
Crie textos de marketing no tom ${o.tom.toLowerCase()}, em português do Brasil, para ${o.plataforma}:
1. 5 legendas de post (até 120 palavras cada), uma para cada dor/necessidade da tabela, com gancho na primeira linha e CTA no final.
2. 5 headlines de anúncio (até 40 caracteres) e 5 descrições (até 125 caracteres).
3. 1 e-mail de nutrição: assunto (3 opções), pré-cabeçalho e corpo de até 200 palavras contando a jornada.
4. 1 bloco de página de vendas: título, subtítulo, 3 benefícios ligados às dores, prova social sugerida e CTA.
Indique, ao lado de cada texto, qual dor da tabela ele atinge e em qual etapa da jornada ele deve aparecer.`,

  imagens: (o) => `## TAREFA
Crie 8 prompts para gerar imagens com IA, um para cada etapa da jornada, para posts em ${o.plataforma}.
Para cada imagem entregue:
- Etapa e dor que a imagem representa.
- Prompt em inglês, detalhado: cena, personagem (o herói), expressão, ambiente, luz, enquadramento, estilo fotográfico e paleta de cores.
- Proporção recomendada (4:5 para feed, 9:16 para stories/reels).
- Prompt negativo (o que evitar: texto na imagem, logos, mãos deformadas, aparência artificial).
- Sugestão de frase curta (em português) para sobrepor na arte.
Mantenha o mesmo personagem e a mesma identidade visual em todas as imagens, com clima ${o.tom.toLowerCase()}. A emoção da cena precisa acompanhar o sentimento do herói em cada etapa.`,

  reels: (o) => `## TAREFA
Escreva 3 roteiros de Reels/vídeo curto (30 a 45 segundos) para ${o.plataforma}, no tom ${o.tom.toLowerCase()}.
Cada roteiro ataca uma dor ou necessidade diferente da tabela.
Formato de cada roteiro:
- Título interno e dor atingida.
- Gancho (0–3 s): fala + texto na tela que prendam quem está rolando o feed.
- Cenas numeradas com tempo (ex.: 3–8 s), o que aparece, a fala e o texto na tela.
- Virada: o momento em que a marca aparece como mentora.
- Final com CTA claro (comentar, salvar, chamar no direct, clicar no link).
- Sugestão de áudio/trilha e de B-roll.
- Legenda do post com 3 a 5 hashtags.
Escreva falas curtas e naturais, como alguém falando com a câmera.`,

  abordagem: (o) => `## TAREFA
Monte um roteiro de abordagem comercial consultiva (WhatsApp, direct e ligação), no tom ${o.tom.toLowerCase()}, em português do Brasil.
Entregue:
1. 3 opções de primeira mensagem (até 280 caracteres), cada uma começando pela dor do herói, não pelo produto.
2. 5 perguntas de diagnóstico para descobrir em qual etapa da jornada a pessoa está.
3. Respostas para cada objeção e obstáculo da tabela: valide o sentimento, responda e convide para o próximo passo.
4. 2 mensagens de follow-up (após 2 e após 5 dias sem resposta) que tragam valor, sem cobrança.
5. Mensagem de fechamento propondo o primeiro passo da etapa "Travessia do limiar".
Regras: nada de pressão ou falsa urgência; a marca guia, o cliente decide.`,

  carrossel: (o) => `## TAREFA
Crie 2 carrosséis para ${o.plataforma}, no tom ${o.tom.toLowerCase()}, com 7 a 10 slides cada.
Carrossel 1: "a jornada do herói" — do mundo comum à recompensa, mostrando a transformação.
Carrossel 2: "as dores que ninguém fala" — um slide para cada dor/necessidade da tabela e como sair dela.
Para cada slide entregue:
- Número do slide.
- Título (até 8 palavras).
- Texto de apoio (até 30 palavras).
- Sugestão visual (imagem, ícone ou gráfico) e destaque de cor.
O slide 1 é a capa com um gancho forte; o penúltimo traz a prova (resultado ou depoimento); o último tem CTA claro (salvar, compartilhar ou chamar no direct).
No final, escreva a legenda de cada carrossel com CTA e hashtags.`,
};

export function gerarPrompt(formato: Formato, j: Jornada, p: Persona, i: number, o: Opcoes) {
  const todas = p.dores ?? [];
  const dores = o.dorId === "todas" ? todas : todas.filter((d) => d.id === o.dorId);
  const foco = o.dorId !== "todas" && dores[0] ? `\n\nFOCO: concentre todo o conteúdo na dor "${dores[0].titulo || dores[0].tipo}".` : "";
  return [
    `Você é um estrategista de conteúdo e copywriter especialista em storytelling e na jornada do herói aplicada ao marketing.`,
    "",
    contexto(j, p, i, dores.length ? dores : todas),
    "",
    TAREFAS[formato](o) + foco,
  ].join("\n");
}
