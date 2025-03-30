import { Test, TestingModule } from '@nestjs/testing';
import { UserContentController } from './user_content.controller';
import { UserContentService } from './user_content.service';

describe('UserContentController', () => {
  let controller: UserContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserContentController],
      providers: [UserContentService],
    }).compile();

    controller = module.get<UserContentController>(UserContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
