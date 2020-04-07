import * as question from "./question";

export class Question {
  constructor(
    public id: question.ID,
    public imageURL: string,
  ) {}
}

function verifyThatIndicesMatch(qb: QuestionBank) {
  for (const [i, q] of qb.questions.entries()) {
    const idx = qb.index(q.id);
    if (i !== idx) {
      throw Error(
        `Unexpected mismatching index() result (== ${idx}) and index in the question (== ${i}`
      );
    }
  }
}

function verifyThatPreviousLoopsThrough(qb: QuestionBank) {
  if (qb.questions.length === 0) {
    throw Error("Unexpected empty question bank");
  }

  const loop = new Array<question.ID>(qb.questions.length + 1);

  let cursor: question.ID = qb.questions[0].id;
  for (let i = 0; i < qb.questions.length + 1; i++) {
    const prev = qb.previous(cursor);
    loop[i] = cursor;
    cursor = prev;
  }

  const expected = [
    qb.questions[0].id,
    ...qb.questions.map((q) => q.id).reverse(),
  ];

  const passed =
    expected.length === loop.length && expected.every((v, i) => loop[i] === v);
  if (!passed) {
    throw Error(`Expected loop (== ${JSON.stringify(expected)} and 
        actual loop (== ${JSON.stringify(loop)}) did not match.`);
  }
}

function verifyThatNextLoopsThrough(qb: QuestionBank) {
  if (qb.questions.length === 0) {
    throw Error("Unexpected empty question bank");
  }

  const loop = new Array<question.ID>(qb.questions.length + 1);

  let cursor: question.ID = qb.questions[0].id;
  for (let i = 0; i < qb.questions.length + 1; i++) {
    const next = qb.next(cursor);
    loop[i] = cursor;
    cursor = next;
  }

  const expected = [...qb.questions.map((q) => q.id), qb.questions[0].id];

  const passed =
    expected.length === loop.length && expected.every((v, i) => loop[i] === v);
  if (!passed) {
    throw Error(`Expected loop (== ${JSON.stringify(expected)} and 
        actual loop (== ${JSON.stringify(loop)}) did not match.`);
  }
}

function verifyAllGet(qb: QuestionBank) {
  for (const q of qb.questions) {
    const got = qb.get(q.id).id;
    const passed = got === q.id;
    if (!passed) {
      throw Error(`Expected question ID ${q.id}, but got: ${got}`);
    }
  }
}

function verifyHas(qb: QuestionBank) {
  for (const q of qb.questions) {
    if (!qb.has(q.id)) {
      throw Error(
        `Expected ID to be positive in has(), but it was not: ${q.id}`
      );
    }
  }
}

function verifyQuestionBank(qb: QuestionBank) {
  verifyThatIndicesMatch(qb);
  verifyThatPreviousLoopsThrough(qb);
  verifyThatNextLoopsThrough(qb);
  verifyAllGet(qb);
  verifyHas(qb);
}

export class QuestionBank {
  private questionIndex: Map<question.ID, number>;
  private questionMap: Map<question.ID, Question>;
  private previousMap: Map<question.ID, question.ID>;
  private nextMap: Map<question.ID, question.ID>;

  constructor(public questions: Array<Question>) {
    this.questionIndex = new Map<question.ID, number>();
    for (const [i, q] of questions.entries()) {
      this.questionIndex.set(q.id, i);
    }

    this.questionMap = new Map<question.ID, Question>();
    for (const q of questions) {
      if (this.questionMap.has(q.id)) {
        throw Error(`Duplicate ID in questions: ${q.id}`);
      }
      this.questionMap.set(q.id, q);
    }

    this.previousMap = new Map<question.ID, question.ID>();
    if (questions.length > 0) {
      this.previousMap.set(questions[0].id, questions[questions.length - 1].id);

      for (let i = 1; i < questions.length; i++) {
        this.previousMap.set(questions[i].id, questions[i - 1].id);
      }
    }

    this.nextMap = new Map<question.ID, question.ID>();
    if (questions.length > 0) {
      this.nextMap.set(questions[questions.length - 1].id, questions[0].id);

      for (let i = questions.length - 2; i >= 0; i--) {
        this.nextMap.set(questions[i].id, questions[i + 1].id);
      }
    }

    verifyQuestionBank(this);
  }

  public index(id: question.ID): number {
    const result = this.questionIndex.get(id);
    if (result === undefined) {
      throw Error(`Question ID is invalid: ${id}`);
    }

    return result;
  }

  public next(id: question.ID): question.ID {
    const result = this.nextMap.get(id);
    if (result === undefined) {
      throw Error(`Question ID is invalid: ${id}`);
    }

    return result;
  }

  public previous(id: question.ID): question.ID {
    const result = this.previousMap.get(id);
    if (result === undefined) {
      throw Error(`Question ID is invalid: ${id}`);
    }

    return result;
  }

  public has(id: question.ID): boolean {
    return this.questionMap.has(id);
  }

  public get(id: question.ID): Question {
    const result = this.questionMap.get(id);
    if (result === undefined) {
      throw Error(`Question ID is invalid: ${id}`);
    }

    return result;
  }
}

export const questionBank = new QuestionBank([
  {
    id: question.ELEPHANT,
    imageURL: "./media/slon.jpeg",
  },
  {
    id: question.TIGER,
    imageURL: "./media/tigar.jpeg",
  },
  {
    id: question.LION,
    imageURL: "./media/lav.jpeg",
  },
  {
    id: question.DOG,
    imageURL: "./media/pas.jpeg",
  },
]);

export function compareAnswers(expected: string, got: string): boolean {
  return expected.toLowerCase() === got.toLowerCase();
}
