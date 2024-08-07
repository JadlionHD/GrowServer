import CryptoJS from "crypto-js";
import type { BaseServer } from "../structures/BaseServer.js";
import { Peer } from "../structures/Peer.js";
import { Collection } from "../structures/Collection.js";
import type { PeerDataType } from "../types";
import { World } from "../structures/World.js";

export function parseAction(chunk: Buffer): Record<string, string | number> | undefined {
  const data: Record<string, string | number> = {};
  chunk[chunk.length - 1] = 0;

  const str = chunk.toString("utf-8", 4);
  const lines = str.split("\n");

  lines.forEach((line) => {
    if (line.startsWith("|")) line = line.slice(1);
    const info = line.split("|");

    const key = info[0];
    let val = info[1];

    if (key && val) {
      if (val.endsWith("\x00")) val = val.slice(0, -1);
      data[key] = val;
    }
  });

  return data;
}

export function find(base: BaseServer, users: Collection<number, PeerDataType>, func: (user: Peer) => boolean) {
  for (const item of users.values()) {
    const peer = users.getSelf(item.netID);
    if (func(peer)) {
      return peer;
    }
  }
  return undefined;
}

export function hashItemsDat(file: Buffer) {
  let hash = 0x55555555;
  file.forEach((x) => (hash = (hash >>> 27) + (hash << 5) + x));
  return hash;
}

export function encrypt(data: string): string {
  return CryptoJS.AES.encrypt(data, process.env.ENCRYPT_SECRET || "").toString();
}
export function decrypt(data: string): string {
  return CryptoJS.AES.decrypt(data, process.env.ENCRYPT_SECRET || "").toString(CryptoJS.enc.Utf8);
}

export function handleSaveAll(server: BaseServer, dcAll = false) {
  server.log.warn(`Saving ${server.cache.users.size} peers & ${server.cache.worlds.size} worlds.`);

  const saveWorlds = () => {
    if (server.cache.worlds.size === 0) process.exit();
    else {
      let o = 0;
      server.cache.worlds.forEach(async (wrld) => {
        const world = new World(server, wrld.name);
        if (typeof world.worldName === "string") await world.saveToDatabase();
        else server.log.warn(`Oh no there's undefined (${o}) world, skipping..`);

        o += 1;
        if (o === server.cache.worlds.size) process.exit();
      });
    }
  };

  if (server.cache.users.size === 0) process.exit();
  else {
    let i = 0;
    server.cache.users.forEach(async (peer) => {
      const player = server.cache.users.getSelf(peer.netID);
      await player.saveToDatabase();
      if (dcAll) {
        player.disconnect("now");
      } else {
        // send onconsolemessage for auto saving
      }
      i += 1;
      if (i === server.cache.users.size) saveWorlds();
    });
  }
}

// Masih rusak woi
export function manageArray(arr: string[], length: number, newItem: string): string[] {
  // Check if the array needs trimming
  if (arr.length > length) {
    arr.shift(); // Remove the first element
  }

  // Check if the new item already exists
  const existingIndex = arr.indexOf(newItem);
  if (existingIndex !== -1) {
    arr.splice(existingIndex, 1); // Remove existing item
  }

  // Add the new item to the end
  arr.push(newItem);

  return arr;
}

export function parseQueryString(query: string): { [key: string]: string } {
  const queryObj: { [key: string]: string } = {};
  const pairs: string[] = query.split("&");

  pairs.forEach((pair) => {
    const [key, value] = pair.split("=");
    queryObj[decodeURIComponent(key)] = decodeURIComponent(value || "");
  });

  return queryObj;
}
