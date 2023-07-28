import { Justification, ParsingError } from 'tutch/dist';

export type TutchResponse =
  | { state: 'UnexpectedError'; msg: string }
  | { state: 'ExpectedError'; contents: ParsingError }
  | { state: 'HasJustifications'; justifications: Justification[] }
  | { state: 'Waiting' };
