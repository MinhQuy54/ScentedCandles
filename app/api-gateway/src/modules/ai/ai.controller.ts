import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { Public } from '../core/auth/decorators/public.decorator';
import { AiService } from './ai.service';
import { ChatRequestDto } from './dto/chat.dto';

@ApiTags('ai')
@Public()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Stream chatbot reply (plain text chunks)' })
  @ApiOkResponse({ description: 'Streaming text response' })
  async chat(
    @Body() dto: ChatRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const abort = new AbortController();
    req.on('close', () => abort.abort());
    await this.aiService.streamChat(dto.message, res, abort.signal);
  }
}
