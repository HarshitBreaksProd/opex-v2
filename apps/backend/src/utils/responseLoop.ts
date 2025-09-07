import { engineResponsePuller } from "@repo/redis/queue";

export class ResponseLoop {
  private idResponseMap: Record<
    string,
    { resolve: (msg?: string) => void; reject: (msg?: string) => void }
  > = {};

  constructor() {
    engineResponsePuller.connect();
    this.runLoop();
  }

  async runLoop() {
    while (1) {
      const res = await engineResponsePuller.xRead(
        {
          key: "stream:engine:response",
          id: "$",
        },
        { BLOCK: 0, COUNT: 1 }
      );

      if (res) {
        const reqType = res[0]?.messages[0]?.message.type;
        const gotId = res[0]!.messages[0]!.message.reqId!;
        console.log("Got a res");
        console.log(res[0]?.messages[0]);

        if (reqType === "user-signup/in-ack") {
          this.idResponseMap[gotId]!.resolve();
          delete this.idResponseMap[gotId];
        } else if (reqType === "trade-open-err") {
          const message = JSON.parse(
            res[0]!.messages[0]!.message.response!
          ).message;
          this.idResponseMap[gotId]!.reject(message);
          delete this.idResponseMap[gotId];
        } else if (reqType === "trade-open-ack") {
          const orderId = JSON.parse(
            res[0]?.messages[0]?.message.response!
          ).orderId;
          this.idResponseMap[gotId]!.resolve(orderId);
          delete this.idResponseMap[gotId];
        }
      }
    }
  }

  async waitForResponse(id: string) {
    return new Promise<void | string>((resolve, reject) => {
      setTimeout(() => {
        if (this.idResponseMap[id]) {
          delete this.idResponseMap[id];
          reject("Response not got within time");
        }
      }, 3500);
      this.idResponseMap[id] = { resolve, reject };
    });
  }
}

export const responseLoopObj = new ResponseLoop();
