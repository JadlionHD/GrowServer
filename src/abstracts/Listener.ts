import type { ListenerEventTypes } from "../types";
import { BaseServer } from "../structures/BaseServer.js";

export abstract class Listener<K extends keyof ListenerEventTypes> {
  public name: keyof ListenerEventTypes | undefined;
  public base: BaseServer;

  constructor(base: BaseServer) {
    this.base = base;
    this.name = undefined;
  }

  public run(...args: ListenerEventTypes[K]): void {}
}
