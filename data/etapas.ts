import {
  Home,
  Megaphone,
  ShieldQuestion,
  Compass,
  DoorOpen,
  Swords,
  Trophy,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type EtapaId =
  | "mundo-comum"
  | "chamado"
  | "recusa"
  | "mentor"
  | "limiar"
  | "provacoes"
  | "recompensa"
  | "retorno";

export type Etapa = {
  id: EtapaId;
  nome: string;
  papel: string;
  pergunta: string;
  dica: string;
  exemplo: string;
  canalSugerido: string;
  emocaoTipica: number;
  icone: LucideIcon;
};

/* A jornada do herói lida com o cliente como herói e a marca como mentora. */
export const ETAPAS: Etapa[] = [
  {
    id: "mundo-comum",
    nome: "Mundo comum",
    papel: "O dia a dia do cliente",
    pergunta: "Como é a rotina do seu cliente antes de conhecer a sua marca?",
    dica: "Descreva o contexto, as tarefas e o que ele já tolera sem perceber. Quanto mais concreto, mais o leitor se reconhece.",
    exemplo:
      "Ana cuida sozinha do marketing de uma loja de cosméticos. Vive entre planilhas, posts de última hora e relatórios que ninguém lê.",
    canalSugerido: "Redes sociais",
    emocaoTipica: 0,
    icone: Home,
  },
  {
    id: "chamado",
    nome: "Chamado à aventura",
    papel: "O problema que desperta",
    pergunta: "Qual acontecimento faz o cliente perceber que precisa mudar?",
    dica: "É o gatilho: uma meta perdida, um concorrente que cresceu, uma conversa com o chefe. Nomeie a dor com as palavras do cliente.",
    exemplo:
      "As vendas do trimestre caem 18% e a diretoria pede um plano em duas semanas. Ana percebe que não sabe de onde vêm os clientes.",
    canalSugerido: "Busca no Google",
    emocaoTipica: -1,
    icone: Megaphone,
  },
  {
    id: "recusa",
    nome: "Recusa do chamado",
    papel: "As objeções e os medos",
    pergunta: "O que faz o cliente hesitar antes de agir?",
    dica: "Liste as objeções reais: preço, tempo, medo de errar, experiências ruins. Sua comunicação precisa responder a cada uma.",
    exemplo:
      "“Já testei três ferramentas e nenhuma pegou.” Ana teme gastar o pouco orçamento e ainda perder semanas configurando tudo.",
    canalSugerido: "Avaliações e indicações",
    emocaoTipica: -2,
    icone: ShieldQuestion,
  },
  {
    id: "mentor",
    nome: "Encontro com o mentor",
    papel: "A sua marca entra em cena",
    pergunta: "Como a sua marca aparece e mostra que entende o problema?",
    dica: "A marca não é a heroína: é o guia. Mostre empatia (“a gente sabe como é”) e autoridade (resultados, números, casos).",
    exemplo:
      "Ana encontra um artigo da marca com um diagnóstico gratuito. Em 5 minutos, descobre os três canais que mais trazem vendas.",
    canalSugerido: "Conteúdo e e-mail",
    emocaoTipica: 1,
    icone: Compass,
  },
  {
    id: "limiar",
    nome: "Travessia do limiar",
    papel: "O primeiro passo concreto",
    pergunta: "Qual é o primeiro compromisso que o cliente assume com você?",
    dica: "Torne a travessia pequena e segura: teste grátis, demonstração, garantia. Um plano claro de 3 passos reduz o medo.",
    exemplo:
      "Ela cria a conta no teste de 14 dias, sem cartão, e importa a planilha antiga em um clique.",
    canalSugerido: "Site e página de cadastro",
    emocaoTipica: 1,
    icone: DoorOpen,
  },
  {
    id: "provacoes",
    nome: "Provações e aliados",
    papel: "Os obstáculos no caminho",
    pergunta: "Que dificuldades surgem no começo e quem ajuda o cliente a vencê-las?",
    dica: "Pense no onboarding: dúvidas, travas, momentos de desânimo. Os aliados são o suporte, a comunidade e os tutoriais.",
    exemplo:
      "Na primeira semana, Ana trava na integração com a loja. O suporte responde em 12 minutos e um vídeo curto resolve o resto.",
    canalSugerido: "Suporte e comunidade",
    emocaoTipica: -1,
    icone: Swords,
  },
  {
    id: "recompensa",
    nome: "A recompensa",
    papel: "A transformação acontece",
    pergunta: "Qual resultado o cliente conquista e como a vida dele muda?",
    dica: "Mostre o antes e depois com números e sentimentos. O cliente não compra o produto: compra quem ele se torna.",
    exemplo:
      "No fim do mês, Ana apresenta um relatório claro à diretoria. O custo por venda cai 27% e ela ganha orçamento para crescer.",
    canalSugerido: "Painel e relatórios",
    emocaoTipica: 2,
    icone: Trophy,
  },
  {
    id: "retorno",
    nome: "Retorno com o elixir",
    papel: "O cliente vira defensor",
    pergunta: "Como o cliente compartilha a conquista e traz outros heróis?",
    dica: "Crie motivos para contar a história: programa de indicação, estudo de caso, comunidade. O fim de uma jornada é o chamado de outra.",
    exemplo:
      "Ana grava um depoimento, indica a ferramenta para duas amigas lojistas e vira estudo de caso no blog da marca.",
    canalSugerido: "Indicação e depoimentos",
    emocaoTipica: 2,
    icone: Sparkles,
  },
];

export const ETAPA_POR_ID = Object.fromEntries(ETAPAS.map((e) => [e.id, e])) as Record<EtapaId, Etapa>;

export const CANAIS = [
  "Redes sociais",
  "Busca no Google",
  "Anúncios pagos",
  "Avaliações e indicações",
  "Conteúdo e e-mail",
  "Site e página de cadastro",
  "WhatsApp",
  "Loja física",
  "Suporte e comunidade",
  "Painel e relatórios",
  "Evento ou webinar",
  "Indicação e depoimentos",
];

export const EMOCOES = [
  { valor: -2, rotulo: "Frustrado" },
  { valor: -1, rotulo: "Inseguro" },
  { valor: 0, rotulo: "Neutro" },
  { valor: 1, rotulo: "Confiante" },
  { valor: 2, rotulo: "Realizado" },
];
