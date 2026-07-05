import { Injectable } from '@nestjs/common';
import { BookService } from '../book/book.service';

@Injectable()
export class ToolExecutor {
  constructor(private readonly bookService: BookService) {}

  async execute(toolName: string, args: any) {
    try {
      switch (toolName) {
        case 'findAllBooks':
          return await this.bookService.findAll();
        case 'findBookByISBN':
          return await this.bookService.findBookByISBN(args.ISBN);
        case 'findBookByName':
          return await this.bookService.findBookByName(args.name);
        case 'findBookByAuthor':
          return await this.bookService.findBookByAuthor(args.author);
        default:
          return { error: `Unknown tool: ${toolName}` };
      }
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Tool execution failed',
      };
    }
  }
}
