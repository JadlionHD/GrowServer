import { Variant } from "growtopia.js";
import { Dialog } from "../abstracts/Dialog.js";
import { BaseServer } from "../structures/BaseServer.js";
import { Peer } from "../structures/Peer.js";
import type { DialogReturnType } from "../types";

export default class extends Dialog {
  constructor(base: BaseServer) {
    super(base);
    this.config = {
      dialogName: "find_item_end"
    };
  }

  public handle(
    peer: Peer,
    action: DialogReturnType<{
      action: string;
      dialog_name: string;
      find_item_name: string;
      buttonClicked: string;
    }>
  ): void {
    const itemID = parseInt(action.buttonClicked);
    peer.data?.inventory?.items.push({ id: itemID, amount: 200 });
    peer.send(Variant.from("OnConsoleMessage", `Added \`6${this.base.items.metadata.items.find((v) => v.id === itemID)?.name?.value}\`\` to your inventory.`));
    peer.inventory();
    peer.saveToCache();
    // peer.saveToDatabase();
  }
}
