import type { SingleDigit } from '../types';

export interface OracleEntry {
  readonly day: SingleDigit;
  readonly title: string;
  readonly kicker: string;
  readonly summary: string;
  readonly counsel: string;
  readonly avoid: string;
}

/**
 * Conselhos determinísticos do Oráculo Diário (Dia Pessoal 1–9).
 * Sem geração por modelo: o texto é fixo e reproduzível.
 */
export const ORACLE_DICTIONARY: Readonly<Record<SingleDigit, OracleEntry>> = {
  1: {
    day: 1,
    title: 'O Plantio',
    kicker: 'Início e vontade',
    summary: 'Dia de iniciativa: plante a semente que o Destino ainda não escreveu.',
    counsel:
      'A vibração 1 abre o ciclo. Comece o que estava só no pensamento: um convite, um traço novo na firma, o primeiro passo de um contrato. A vontade hoje materializa — desde que você assine com clareza, sem pedir licença ao medo. É dia de liderar a própria narrativa, não de esperar o mundo nomear o seu rumo.',
    avoid:
      'Evite espalhar energia em dez começos. Não empreste a sua iniciativa a planos alheios nem dissipe o fogo em discussões. O 1 não recua: se plantar dúvida, a semente germina torta.',
  },
  2: {
    day: 2,
    title: 'A Escuta',
    kicker: 'Parceria e timing',
    summary: 'Dia de receptividade: a aliança certa chega para quem sabe esperar o momento.',
    counsel:
      'O 2 pede silêncio fértil. Ouça o contrato, a pessoa, o número que o triângulo ainda não revelou. Parcerias, mediações e decisões a dois encontram chão hoje — se você não forçar o ritmo. A Sacerdotisa governa a espera lúcida: o que se revela à meia-luz vale mais do que o anúncio precipitado.',
    avoid:
      'Não decida no impulso nem assine em dúvida. Evite polarizar relações e não interprete o silêncio do outro como abandono. O 2 se perde quando tenta ser 1.',
  },
  3: {
    day: 3,
    title: 'A Expressão',
    kicker: 'Criação e magnetismo',
    summary: 'Dia de criar e ser visto: a palavra e a beleza abrem portas.',
    counsel:
      'A Imperatriz floresce no 3. Escreva, apresente, celebre, dê forma visível ao que o Destino já germinou. Conversas, arte e reconhecimento circulam — a firma próspera hoje é a que se mostra sem se diluir. Expanda com elegância: o magnetismo deste dia atrai recursos quando a expressão permanece ascendente.',
    avoid:
      'Fuja da dispersão e da vaidade vazia. Não prometa o que a matéria ainda não sustenta e evite fofoca vestida de brilho. O 3 que se espalha não colhe.',
  },
  4: {
    day: 4,
    title: 'A Oficina',
    kicker: 'Ordem e trabalho',
    summary: 'Dia de trabalho duro e estrutura: construa, organize, não desperdice.',
    counsel:
      'O Imperador pede chão. É dia de disciplina, contas, rotina e o traço firme que sustenta o império. Coloque ordem na casa, no contrato, na firma: o 4 constrói reputação no invisível do esforço. Cada tarefa concluída hoje vira alicerce — a prosperidade deste ciclo não chega como milagre, chega como ofício.',
    avoid:
      'Evite gastos impulsivos, atalhos e a tentação de abandonar o plano. Não engessse o dia em rigidez amarga, mas não solte a estrutura. O 4 que se desorganiza vira o bloqueio 444.',
  },
  5: {
    day: 5,
    title: 'O Movimento',
    kicker: 'Mudança e liberdade',
    summary: 'Dia de deslocar o rumo: a mudança consciente reabre o caminho.',
    counsel:
      'O 5 inquieta para libertar. Aceite o convite da estrada, da conversa inesperada, da revisão de um acordo que já não serve. A liberdade hoje é sagrada se tiver direção: mude o que está morto, não o que ainda está germinando. Viaje, estude, quebre o script — a firma que não desce acompanha a Roda para cima.',
    avoid:
      'Não fuja por impulsividade nem quebre o que mal começou. Evite excessos, apostas cegas e a inquietação que troca um destino por outro a cada hora. O 5 sem eixo vira 555.',
  },
  6: {
    day: 6,
    title: 'O Ninho',
    kicker: 'Cuidado e dever',
    summary: 'Dia de nutrir vínculos: casa, afeto e responsabilidade encontram harmonia.',
    counsel:
      'Os Enamorados e a família do 6 pedem presença. Cuide do ninho, do acordo afetivo, da beleza do que é compartilhado. Harmonize dívidas emocionais com gestos concretos — uma conversa, um conserto, um sim consciente. A prosperidade deste dia passa pelo outro: o que você nutre, nutre você.',
    avoid:
      'Não carregue o dever de todos nem sacrifique a própria firma no altar alheio. Evite chantagem afetiva, ciúme e a culpa que trava o 666. Cuidar não é desaparecer.',
  },
  7: {
    day: 7,
    title: 'O Recolhimento',
    kicker: 'Estudo e verdade interior',
    summary: 'Dia de silêncio fecundo: a sabedoria chega longe do palco.',
    counsel:
      'O Eremita acende a lâmpada. Estude, calcule, ore, revise o mapa — o 7 revela o que a agitação esconde. É dia de análise, de espiritualidade prática e de recusar o ruído. A verdade interior hoje vale mais do que o aplauso. Se a firma precisa de retificação, este é o dia de olhar o triângulo com honestidade.',
    avoid:
      'Não se isole até desaparecer nem desconfie de toda aliança. Evite cinismo, excesso de análise que paralisa e a tentação de guardar o ouro só para si. O 7 que se fecha vira 777.',
  },
  8: {
    day: 8,
    title: 'O Poder',
    kicker: 'Colheita e autoridade',
    summary: 'Dia de colher e conduzir: recursos e autoridade pedem retidão.',
    counsel:
      'A Justiça e o 8 pesam o que você construiu. Negocie, cobre, lidere, colha o fruto do ofício — com ética visível. O poder hoje circula para quem alinha a firma ao Destino: contratos, reconhecimento e matéria respondem à coerência. Assine como quem sustenta um império, não como quem implora um favor.',
    avoid:
      'Evite abuso de força, ganância e a conta que não fecha. Não misture poder com vingança nem gaste a colheita inteira. O 8 desequilibrado trava no 888: autoridade em loop, sem prosperidade.',
  },
  9: {
    day: 9,
    title: 'O Encerramento',
    kicker: 'Ciclo e limpeza',
    summary: 'Dia de fechar ciclos e limpar: solte o que já deveria partir.',
    counsel:
      'O 9 conclui. Encerre o combinado, perdoe o que emperra, doe o excesso, limpe a mesa e a firma. O que termina hoje libera espaço para o 1 que virá. É dia de desapego lúcido — não de drama: uma carta, um acerto, um traço que não se repete. A limpeza é sagrada: o Destino não cabe no que já morreu.',
    avoid:
      'Não comece um ciclo novo no lugar de fechar o antigo. Evite nostalgia que prende, vinganças tardias e o acúmulo de papéis, dívidas e nomes. O 9 que não solta vira 999: o fim que nunca chega.',
  },
};

export function lookupOracleEntry(day: SingleDigit): OracleEntry {
  const entry = ORACLE_DICTIONARY[day];
  if (entry === undefined) {
    throw new Error(`No oracle entry for personal day ${day}.`);
  }
  return entry;
}
