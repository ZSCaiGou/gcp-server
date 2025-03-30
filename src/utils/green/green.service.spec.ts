import { Test, TestingModule } from '@nestjs/testing';
import { GreenService } from './green.service';

describe('GreenService', () => {
  let service: GreenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GreenService],
    }).compile();

    service = module.get<GreenService>(GreenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
