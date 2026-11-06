import type { EtapaId } from "./etapas";

export type ModeloCartao = { texto: string; canal: string; emocao: number };

export type Modelo = {
  id: string;
  setor: "SaaS" | "Varejo" | "Serviços" | "Educação";
  nome: string;
  marca: string;
  heroi: string;
  transformacao: string;
  resumo: string;
  cartoes: Record<EtapaId, ModeloCartao>;
};

export const MODELOS: Modelo[] = [
  {
    id: "saas-gestao",
    setor: "SaaS",
    nome: "Software de gestão para pequenas empresas",
    marca: "Fluxa",
    heroi: "Rafael, dono de uma distribuidora com 12 funcionários",
    transformacao: "de apagar incêndios a decidir com números",
    resumo: "Do caos das planilhas ao painel que mostra o lucro do dia.",
    cartoes: {
      "mundo-comum": { texto: "Rafael fecha o caixa à meia-noite, cruzando três planilhas e o extrato do banco. Sabe que vende bem, mas não sabe quanto lucra.", canal: "Redes sociais", emocao: 0 },
      chamado: { texto: "Um cliente grande atrasa o pagamento e o caixa fica no vermelho. Rafael percebe que trabalha no escuro.", canal: "Busca no Google", emocao: -1 },
      recusa: { texto: "“Sistema é caro e complicado. Minha equipe não vai usar.” Ele adia a decisão por dois meses.", canal: "Avaliações e indicações", emocao: -2 },
      mentor: { texto: "Um vídeo da Fluxa mostra um dono de distribuidora explicando como enxergou o lucro em 7 dias. Rafael se vê ali.", canal: "Conteúdo e e-mail", emocao: 1 },
      limiar: { texto: "Ele agenda uma demonstração de 20 minutos e sai com a conta criada e as planilhas importadas.", canal: "Site e página de cadastro", emocao: 1 },
      provacoes: { texto: "A equipe resiste ao novo processo de pedidos. O time de implantação faz um treinamento por WhatsApp em grupo.", canal: "Suporte e comunidade", emocao: -1 },
      recompensa: { texto: "Em 60 dias, Rafael reduz a inadimplência em 35% e fecha o caixa em 10 minutos, às 18h.", canal: "Painel e relatórios", emocao: 2 },
      retorno: { texto: "Ele conta a história na associação comercial da cidade e indica a Fluxa para quatro empresários.", canal: "Indicação e depoimentos", emocao: 2 },
    },
  },
  {
    id: "varejo-moda",
    setor: "Varejo",
    nome: "Loja de moda feminina online",
    marca: "Ateliê Lume",
    heroi: "Juliana, 34 anos, advogada que compra pelo celular",
    transformacao: "de insegura com o próprio estilo a confiante em qualquer reunião",
    resumo: "Da gaveta cheia sem ter o que vestir ao guarda-roupa que funciona.",
    cartoes: {
      "mundo-comum": { texto: "Juliana tem o armário cheio, mas repete as mesmas três roupas para trabalhar. Compra por impulso e se arrepende.", canal: "Redes sociais", emocao: 0 },
      chamado: { texto: "Ela é promovida e vai liderar reuniões com clientes. Sente que as roupas não acompanham o novo momento.", canal: "Anúncios pagos", emocao: -1 },
      recusa: { texto: "“Roupa online nunca serve.” Medo de errar o tamanho e de pagar caro por algo que não combina com ela.", canal: "Avaliações e indicações", emocao: -2 },
      mentor: { texto: "O Ateliê Lume oferece um quiz de estilo e uma consultora pelo WhatsApp que monta 5 looks com o que ela já tem.", canal: "WhatsApp", emocao: 1 },
      limiar: { texto: "Juliana faz a primeira compra com troca grátis em 30 dias e guia de medidas personalizado.", canal: "Site e página de cadastro", emocao: 1 },
      provacoes: { texto: "Uma calça chega apertada. A troca é coletada em casa em 48 horas e a consultora sugere outro corte.", canal: "Suporte e comunidade", emocao: -1 },
      recompensa: { texto: "Ela monta 20 combinações com 12 peças e recebe elogios na primeira reunião com o cliente mais importante.", canal: "Conteúdo e e-mail", emocao: 2 },
      retorno: { texto: "Juliana posta os looks, marca a loja e usa o cupom de indicação com as colegas do escritório.", canal: "Indicação e depoimentos", emocao: 2 },
    },
  },
  {
    id: "servicos-consultoria",
    setor: "Serviços",
    nome: "Consultoria de marketing para clínicas",
    marca: "Pulso Consultoria",
    heroi: "Dra. Camila, dentista com clínica própria há 6 anos",
    transformacao: "de agenda vazia às terças a lista de espera",
    resumo: "Da dependência de indicações a um fluxo previsível de pacientes.",
    cartoes: {
      "mundo-comum": { texto: "A clínica vive de indicações. Alguns meses lotam, outros ficam com horários vagos e a equipe ociosa.", canal: "Loja física", emocao: 0 },
      chamado: { texto: "Uma rede de clínicas abre a duas quadras, com anúncios em todo lugar. Os agendamentos caem 30%.", canal: "Anúncios pagos", emocao: -1 },
      recusa: { texto: "“Já paguei agência e só recebi curtidas.” Camila desconfia de marketing e acha que não é para a área da saúde.", canal: "Avaliações e indicações", emocao: -2 },
      mentor: { texto: "Num webinar da Pulso, ela vê o caso de outra dentista que dobrou as avaliações de implante em 90 dias, respeitando as regras do conselho.", canal: "Evento ou webinar", emocao: 1 },
      limiar: { texto: "Camila aceita um diagnóstico gratuito e um plano de 90 dias com metas por semana e garantia de resultado.", canal: "WhatsApp", emocao: 1 },
      provacoes: { texto: "A recepção não dá conta dos novos contatos. A Pulso cria roteiros de atendimento e treina a equipe.", canal: "Suporte e comunidade", emocao: -1 },
      recompensa: { texto: "Em três meses, a agenda fica cheia com duas semanas de antecedência e o faturamento cresce 42%.", canal: "Painel e relatórios", emocao: 2 },
      retorno: { texto: "Camila palestra num congresso regional sobre a experiência e vira parceira de indicação da Pulso.", canal: "Indicação e depoimentos", emocao: 2 },
    },
  },
  {
    id: "educacao-curso",
    setor: "Educação",
    nome: "Curso online de inglês para profissionais",
    marca: "Fala Pro",
    heroi: "Marcos, 41 anos, gerente de logística",
    transformacao: "de travar em reuniões a conduzir apresentações em inglês",
    resumo: "Do medo de falar à primeira reunião internacional conduzida sozinho.",
    cartoes: {
      "mundo-comum": { texto: "Marcos entende e-mails em inglês, mas fica em silêncio nas chamadas com a matriz. Deixa os colegas falarem por ele.", canal: "Redes sociais", emocao: 0 },
      chamado: { texto: "Surge uma vaga de diretor regional que exige inglês fluente. Ele sabe que é o melhor nome, menos pelo idioma.", canal: "Busca no Google", emocao: -1 },
      recusa: { texto: "“Já comecei cinco cursos e larguei todos. Não tenho tempo com a rotina que levo.”", canal: "Avaliações e indicações", emocao: -2 },
      mentor: { texto: "A Fala Pro mostra aulas de 25 minutos focadas em situações reais de trabalho, com professor ao vivo.", canal: "Anúncios pagos", emocao: 1 },
      limiar: { texto: "Ele faz uma aula experimental gratuita no horário do almoço e recebe um plano de 12 semanas.", canal: "Site e página de cadastro", emocao: 1 },
      provacoes: { texto: "Na quarta semana, perde três aulas seguidas. O app reagenda tudo e o professor manda um áudio de incentivo.", canal: "WhatsApp", emocao: -1 },
      recompensa: { texto: "Marcos conduz a reunião trimestral com a matriz em inglês e é aprovado para a vaga de diretor.", canal: "Evento ou webinar", emocao: 2 },
      retorno: { texto: "Ele recomenda o curso para a equipe toda e a empresa fecha um plano corporativo.", canal: "Indicação e depoimentos", emocao: 2 },
    },
  },
];
