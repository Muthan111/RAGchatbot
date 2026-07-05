import { SchemaType, FunctionDeclaration } from '@google/generative-ai';

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: 'findAllBooks',
    description: 'Retrieve all books in the library catalog.',
    parameters: { type: SchemaType.OBJECT, properties: {} },
  },
  {
    name: 'findBookByISBN',
    description: 'Find a single book by its ISBN.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        ISBN: { type: SchemaType.STRING, description: 'The ISBN of the book' },
      },
      required: ['ISBN'],
    },
  },
  {
    name: 'findBookByName',
    description: 'Find books matching a given title.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        name: { type: SchemaType.STRING, description: 'The title of the book' },
      },
      required: ['name'],
    },
  },
  {
    name: 'findBookByAuthor',
    description: 'Find books written by a given author.',
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        author: { type: SchemaType.STRING, description: 'The author name' },
      },
      required: ['author'],
    },
  },
];
