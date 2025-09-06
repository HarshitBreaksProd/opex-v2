import { engineResponsePuller } from "@repo/redis/queue";
import { Response } from "express";

export class ResponseLoop {
  private idResponseMap: Record<string, () => void> = {};

  constructor() {
    engineResponsePuller.connect();
    this.runLoop();
  }

  async runLoop() {
    while (1) {
      const ackRes = await engineResponsePuller.xRead(
        {
          key: "stream:trade:acknowledgement",
          id: "$",
        },
        { BLOCK: 0, COUNT: 1 }
      );

      if (ackRes) {
        if (
          ackRes[0]?.messages[0]?.message.type === "trade-acknowledgement" &&
          ackRes[0].messages[0].message.message
        ) {
          const gotId = JSON.parse(ackRes[0].messages[0].message.message).id;
          this.idResponseMap[gotId]!();
          delete this.idResponseMap[gotId];
        }
      }
    }
  }

  async waitForResponse(id: string) {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (this.idResponseMap[id]) {
          delete this.idResponseMap[id];
          reject("Response not got within time");
        }
      }, 3500);
      this.idResponseMap[id] = resolve;
    });
  }
}
