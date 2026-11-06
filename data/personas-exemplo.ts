import type { EtapaId } from "./etapas";
import type { ModeloCartao } from "./modelos";
import { MODELOS } from "./modelos";

export type PersonaExemplo = {
  nome: string;
  papel: string;
  heroi: string;
  transformacao: string;
  cartoes: Record<EtapaId, ModeloCartao>;
};

const fluxa = MODELOS[0];

/* Uma marca, três heróis: a mesma Fluxa vista pelo dono, pela financeira e pelo vendedor. */
export const MARCA_EXEMPLO = fluxa.marca;

export const PERSONAS_EXEMPLO: PersonaExemplo[] = [
  {
    nome: "Rafael",
    papel: "Dono da distribuidora",
    heroi: fluxa.heroi,
    transformacao: fluxa.transformacao,
    cartoes: fluxa.cartoes,
  },
  {
    nome: "Bruna",
    papel: "Analista financeira",
    heroi: "Bruna, analista financeira que concilia tudo à mão",
    transformacao: "de conferir planilhas até tarde a fechar o mês em um dia",
    cartoes: {
      "mundo-comum": { texto: "Bruna passa a primeira semana do mês conferindo boletos, notas e extratos, linha por linha.", canal: "Redes sociais", emocao: -1 },
      chamado: { texto: "Um erro de conciliação gera multa e o dono pede um relatório que ela leva três dias para montar.", canal: "Busca no Google", emocao: -2 },
      recusa: { texto: "“Vou ter que migrar tudo e ainda ser cobrada se der errado.” Ela teme perder o controle que já tem.", canal: "Avaliações e indicações", emocao: -2 },
      mentor: { texto: "Um guia da Fluxa mostra a conciliação automática com o banco, passo a passo, sem apagar o histórico.", canal: "Conteúdo e e-mail", emocao: 0 },
      limiar: { texto: "Ela importa um mês antigo no ambiente de teste e confere: os números batem com a planilha.", canal: "Site e página de cadastro", emocao: 1 },
      provacoes: { texto: "Algumas categorias vêm trocadas. O suporte ajusta as regras com ela numa chamada de 15 minutos.", canal: "Suporte e comunidade", emocao: 0 },
      recompensa: { texto: "O fechamento cai de cinco dias para um. Bruna entrega o relatório antes de o dono pedir.", canal: "Painel e relatórios", emocao: 2 },
      retorno: { texto: "Ela vira a referência da empresa no sistema e treina quem chega no time.", canal: "Indicação e depoimentos", emocao: 1 },
    },
  },
  {
    nome: "Tiago",
    papel: "Vendedor externo",
    heroi: "Tiago, vendedor que atende 40 clientes na rua",
    transformacao: "de anotar pedido no caderno a fechar venda na hora pelo celular",
    cartoes: {
      "mundo-comum": { texto: "Tiago anota pedidos no caderno e passa tudo por WhatsApp no fim do dia. Às vezes esquece um item.", canal: "WhatsApp", emocao: 0 },
      chamado: { texto: "Perde um cliente porque prometeu um produto que estava sem estoque.", canal: "Loja física", emocao: -1 },
      recusa: { texto: "“Mais um aplicativo para eu preencher? Eu vendo, não fico digitando.”", canal: "Avaliações e indicações", emocao: -1 },
      mentor: { texto: "O dono mostra o app da Fluxa: estoque na tela e pedido em três toques, mesmo sem internet.", canal: "Conteúdo e e-mail", emocao: 1 },
      limiar: { texto: "Ele testa em uma rota só, com os cinco clientes que mais compram.", canal: "Site e página de cadastro", emocao: 1 },
      provacoes: { texto: "Na primeira semana, o sinal cai no interior. O pedido fica guardado e sobe sozinho quando volta.", canal: "Suporte e comunidade", emocao: 0 },
      recompensa: { texto: "Tiago visita mais clientes por dia, não erra mais estoque e bate a meta do trimestre.", canal: "Painel e relatórios", emocao: 2 },
      retorno: { texto: "Mostra o app para os vendedores de outra praça, que pedem para usar também.", canal: "Indicação e depoimentos", emocao: 2 },
    },
  },
];
