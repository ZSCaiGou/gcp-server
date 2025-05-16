import { Test, TestingModule } from '@nestjs/testing';
import { CommunityacitonController } from './communityaciton.controller';
import { CommunityacitonService } from './communityaciton.service';

describe('CommunityacitonController', () => {
    let controller: CommunityacitonController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommunityacitonController],
            providers: [CommunityacitonService],
        }).compile();

        controller = module.get<CommunityacitonController>(
            CommunityacitonController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
