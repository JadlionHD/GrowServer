import { TankPacket, Variant } from "growtopia.js";
import { Action } from "../abstracts/Action.js";
import { BaseServer } from "../structures/BaseServer.js";
import { Peer } from "../structures/Peer.js";
import type { ActionType } from "../types";

export default class extends Action {
  constructor(base: BaseServer) {
    super(base);
    this.config = {
      eventName: "join_request"
    };
  }

  public handle(peer: Peer, action: ActionType<{ action: string; name: string }>): void {
    const worldName: string = action.name || "";
    if (worldName.length <= 0) {
      peer.send(Variant.from("OnFailedToEnterWorld", 1), Variant.from("OnConsoleMessage", "That world name is uhh `9empty``"));
      return;
    }
    if (worldName.match(/\W+|_|EXIT/gi)) {
      peer.send(Variant.from("OnFailedToEnterWorld", 1), Variant.from("OnConsoleMessage", "That world name is too `9special`` to be entered."));
      return;
    }

    setTimeout(() => {
      peer.enterWorld(worldName.toUpperCase());
    }, 300);
  }
}
