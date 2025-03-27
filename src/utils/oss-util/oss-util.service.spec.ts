import { Test, TestingModule } from '@nestjs/testing';
import { OssUtilService } from './oss-util.service';

describe('OssUtilService', () => {
  let service: OssUtilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OssUtilService],
    }).compile();

    service = module.get<OssUtilService>(OssUtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
