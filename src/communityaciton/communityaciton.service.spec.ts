import { Test, TestingModule } from '@nestjs/testing';
import { CommunityacitonService } from './communityaciton.service';

describe('CommunityacitonService', () => {
  let service: CommunityacitonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommunityacitonService],
    }).compile();

    service = module.get<CommunityacitonService>(CommunityacitonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
