import { Module } from '@nestjs/common';
import { BookService } from './book.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from '../user/user.entity';
import { Book } from '../book/book.entity';
import { BorrowRecord } from '../borrow/borrow.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([BorrowRecord, Book]),
    // MetricsModule,
  ],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
