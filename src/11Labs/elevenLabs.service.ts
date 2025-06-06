import { ElevenLabsClient } from "elevenlabs";
import "dotenv/config";
import { Injectable, Logger } from "@nestjs/common";
import { SpeechToTextChunkResponseModel } from "elevenlabs/api/types";
import { ok, err, ResultAsync, fromPromise } from 'neverthrow';
import { s2tErrType, t2sErrType } from "interfaces/types";

const client = new ElevenLabsClient();


@Injectable()
export class ElevenLabsService {
  private readonly logger = new Logger(ElevenLabsService.name);

  async speech2text(audioBlob: Blob): Promise<ResultAsync<SpeechToTextChunkResponseModel, s2tErrType>> {
    const response = await fromPromise(client.speechToText.convert({
      file: audioBlob,
      model_id: "scribe_v1",
      tag_audio_events: false, // Tag audio events like laughter, applause, etc.
      language_code: "amh",
      diarize: false, // Whether to annotate who is speaking
    }), e => e);

    if (response.isErr()) {
      this.logger.error(response.error)
      const error: s2tErrType = "Speech2TextError"
      return err(error)
    }
    return ok(response.value)
  }

  async text2speech(text: string): Promise<ResultAsync<ArrayBuffer, t2sErrType>> {
    this.logger.log(`Trying to convert ${text}`)
    const response = await fromPromise(client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
      output_format: "mp3_44100_128",
      text,
      model_id: "eleven_multilingual_v2"
    }), e => e);

    if (response.isErr()) {
      this.logger.error(response.error)
      const error: t2sErrType = "Text2SpeechError"
      return err(error)
    }
    console.log("text 2 speech", response.isErr(), response.value)

    const chunks: Buffer[] = [];

    for await (const chunk of response.value) {
      chunks.push(chunk);
    }

    return ok(Buffer.concat(chunks));
  }
}
