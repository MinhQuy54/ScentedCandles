import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokensController } from './refresh-tokens.controller';
import { RefreshTokensService } from './refresh-tokens.service';

describe('RefreshTokensController', () => {
  let controller: RefreshTokensController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokensController],
      providers: [RefreshTokensService],
    }).compile();

    controller = module.get<RefreshTokensController>(RefreshTokensController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
