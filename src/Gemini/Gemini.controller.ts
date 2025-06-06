import { Body, Controller, Logger, Post } from "@nestjs/common";
import { GeminiService } from "./Gemini.service";
import { MatchContactDTO } from "../../interfaces/contacts";
import { TextCommandDto } from "../../interfaces/dto";
import { ApiBody } from "@nestjs/swagger";

@Controller()
export class GeminiController {
  constructor(private ai: GeminiService) { }
  private readonly logger = new Logger(GeminiController.name);

  @Post("/changeText2Command")
  @ApiBody({ type: TextCommandDto })
  async changeTextToCommand(@Body() body: TextCommandDto) {
    this.logger.log(body)
    const { text } = body;
    this.logger.log(text)
    if (text) {
      const data = await this.ai.changeTextToCommand(text)
      if (data.isErr()) {
        return
      }
      return data.value.text
    }
  }

  @Post("/matchContact")
  async matchContact(@Body() matchContactDto: MatchContactDTO) {
    this.logger.log(matchContactDto)
    const data = await this.ai.matchContact(matchContactDto.name, matchContactDto.contacts)
    if (data.isErr()) {
      return
    }
    return data.value.text
  }
}
