import type { MajorArcana } from './major-arcana';

export interface ArcanaMeaning {
  readonly archetype: string;
  readonly nameVibration: string;
}

/**
 * Leituras curtas para o visualizador do Triângulo da Vida.
 * O arquétipo descreve o Arcano; a vibração explica como ele opera no nome escrito.
 */
export const ARCANA_MEANINGS: Readonly<Record<number, ArcanaMeaning>> = {
  0: {
    archetype:
      'O Louco é o salto no vazio: potencial ilimitado, início sem mapa e coragem de não se prender ao que já foi nomeado.',
    nameVibration:
      'No nome, essa vibração pede movimento e reinvenção. A firma não se cristaliza — ela experimenta caminhos novos, com o risco e a liberdade de quem ainda não escolheu uma máscara definitiva.',
  },
  1: {
    archetype:
      'O Mago é a vontade que materializa. Concentração, iniciativa e o poder de unir o céu e a terra com as próprias mãos.',
    nameVibration:
      'Na firma, o 1 acende autoria. A pessoa tende a assinar como quem inicia ciclos, lidera a narrativa e transforma intenção em traço visível no mundo.',
  },
  2: {
    archetype:
      'A Sacerdotisa guarda o saber silencioso: intuição, receptividade e o que se revela só para quem observa além da superfície.',
    nameVibration:
      'No nome, o 2 sensibiliza a escuta interior. A vibração pede discreção, timing e confiança no que não está escrito — o subtexto da identidade.',
  },
  3: {
    archetype:
      'A Imperatriz é criação fértil: beleza, nutrição, abundância e a inteligência que faz a vida florescer.',
    nameVibration:
      'Na assinatura, o 3 expande expressão e magnetismo. O nome vira um campo criativo, capaz de atrair recursos, afeto e reconhecimento quando o traço permanece ascendente.',
  },
  4: {
    archetype:
      'O Imperador estrutura o império: ordem, autoridade, limites claros e a disciplina que sustenta o poder.',
    nameVibration:
      'No triângulo, o 4 pede firmeza no traçado. A vibração constrói reputação e domínio prático — mas, em excesso, pode engessar a firma e gerar bloqueios de repetição.',
  },
  5: {
    archetype:
      'O Hierofante é o mediador da lei sagrada: tradição, ensino, códigos sociais e a ponte entre o indivíduo e o coletivo.',
    nameVibration:
      'No nome, o 5 regula como a pessoa é lida em público. Harmoniza a firma com ritos, contratos e pertencimento — ou denuncia quando a identidade está só repetindo um script alheio.',
  },
  6: {
    archetype:
      'Os Enamorados falam de escolha afetiva: união, valores e o cruzamento de caminhos que exige decisão consciente.',
    nameVibration:
      'Na vibração do nome, o 6 aproxima relações e alianças. A firma ganha calor humano, mas pede clareza: assinar em dúvida dilui o Destino entre dois polos.',
  },
  7: {
    archetype:
      'O Carro é vitória dirigida: foco, avanço e o domínio das forças que puxam em direções opostas.',
    nameVibration:
      'No traço, o 7 imprime rumo. A pessoa tende a assinar como quem segue em frente — a firma próspera aqui é a que não desce, porque o Carro não recua.',
  },
  8: {
    archetype:
      'A Justiça pesa a verdade: equilíbrio, consequência e a retidão que alinha o que se faz com o que se é.',
    nameVibration:
      'No nome, o 8 cobra coerência entre a firma e o Destino. Cada letra vira um prato da balança: a retificação da assinatura é, literalmente, um ato de Justiça.',
  },
  9: {
    archetype:
      'O Eremita ilumina de dentro: sabedoria solitária, busca sincera e a lâmpada que não pede palco.',
    nameVibration:
      'Na pirâmide, o 9 aprofunda o sentido do nome. A vibração afasta vaidade e pede uma firma mais essencial — menos ruído, mais verdade interior.',
  },
  10: {
    archetype:
      'A Roda da Fortuna gira os ciclos: sorte, virada de fase e o ritmo que ninguém controla por completo.',
    nameVibration:
      'Quando a soma revela 10, o nome entra em movimento de época. A firma pode abrir portas inesperadas — desde que o traço acompanhe a roda para cima, não para o refluxo.',
  },
  11: {
    archetype:
      'A Força é domínio sereno do instinto: coragem mansa, vitalidade e a fera que se torna aliada.',
    nameVibration:
      'No nome, o 11 (que na pirâmide se reduz a 2) pede maestria emocional. A assinatura ganha presença sem agressão: poder que não precisa gritar para ser reconhecido.',
  },
  12: {
    archetype:
      'O Pendurado inverte o olhar: pausa sagrada, entrega e a sabedoria que nasce quando se solta o controle.',
    nameVibration:
      'Na vibração do nome, o 12 pede um intervalo. Antes de retificar a firma, observa-se o padrão antigo de cabeça para baixo — o que parecia queda pode ser iniciação.',
  },
  13: {
    archetype:
      'A Morte não é o fim: é a colheita do que já amadureceu e a passagem obrigatória para outra forma.',
    nameVibration:
      'Quando 8+5 (ou equivalentes) revelam 13, o nome pede mutação. A firma antiga morre para que uma grafia mais alinhada ao Destino possa nascer.',
  },
  14: {
    archetype:
      'A Temperança é alquimia: mistura justa, cura do excesso e o fluxo que une opostos sem os destruir.',
    nameVibration:
      'No triângulo, o 14 ensina a dosar letras e espaços. A vibração do nome se refina — nem rigidez do 4, nem dispersão do 5, e sim um traço temperado.',
  },
  15: {
    archetype:
      'O Diabo nomeia o apego: desejo, matéria, contratos invisíveis e o que nos prende por prazer ou medo.',
    nameVibration:
      'Na firma, o 15 alerta para identificações que escravizam. O nome pode estar amarrado a um papel social, a uma grafia de bloqueio ou a um traço que desce por hábito.',
  },
  16: {
    archetype:
      'A Torre rompe a estrutura falsa: revelação brusca, queda de máscaras e o raio que liberta ao destruir.',
    nameVibration:
      'Quando esse arcano aparece no triângulo, a identidade escrita pede um corte. Assinaturas engessadas ruem para que a firma verdadeira tenha espaço.',
  },
  17: {
    archetype:
      'A Estrela restaura a fé: inspiração, guia interior e a água que volta a fluir depois da tempestade.',
    nameVibration:
      'No nome, o 17 reabre esperança e vocação. A firma se torna um farol — um traço que lembra à pessoa o rumo, mesmo depois de um bloqueio.',
  },
  18: {
    archetype:
      'A Lua habita o inconsciente: imagem, sonho, medo e a verdade que se distorce no reflexo da água.',
    nameVibration:
      'Na pirâmide, o 18 pede que se questione a persona. Nem toda letra do nome está consciente — há sombras e ecos familiares moldando a grafia.',
  },
  19: {
    archetype:
      'O Sol clarifica: vitalidade, sucesso visível e a criança que brilha sem se esconder.',
    nameVibration:
      'Quando o 19 ilumina o triângulo, a firma pede visibilidade. O nome quer ser visto com clareza — traço ascendente, presença nítida, Destino ao sol.',
  },
  20: {
    archetype:
      'O Julgamento chama de volta à vida: despertar, vocação e o chamado que não se pode mais adiar.',
    nameVibration:
      'No nome, o 20 é um convite a reassinar o próprio destino. A retificação da firma vira um rito de passagem: a pessoa responde ao chamado com um traço novo.',
  },
  21: {
    archetype:
      'O Mundo completa o ciclo: integração, realização e a dança de quem já percorreu os arcanos e voltou inteiro.',
    nameVibration:
      'Na vibração do nome, o 21 aponta maturidade da identidade. A firma pode coroar um processo — o ápice em harmonia com o Destino, o traço fechando um círculo próspero.',
  },
};

export function meaningForArcana(arcana: MajorArcana): ArcanaMeaning {
  const meaning = ARCANA_MEANINGS[arcana.id];
  const fallback = ARCANA_MEANINGS[0];
  if (meaning !== undefined) {
    return meaning;
  }
  if (fallback === undefined) {
    throw new Error('Arcana meanings table is empty.');
  }
  return fallback;
}

export function formatArcanaTitle(arcana: MajorArcana, unreducedSum?: number): string {
  const number = unreducedSum === 22 ? 22 : arcana.id;
  return `Arcano ${number} — ${arcana.namePt}`;
}
