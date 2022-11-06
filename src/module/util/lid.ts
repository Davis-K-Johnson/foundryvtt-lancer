import { LancerActor } from "../actor/lancer-actor";
import { FetcherCache } from "./async";
import { LancerItem } from "../item/lancer-item";
import { EntryType } from "../enums";

// Mechanisms for LID resolution

/**
 * Lookup all documents with the associated lid in the given types.
 * Document types are checked in order. If no type(s) supplied, all are queried.
 * short_circuit will make it stop with first valid result. Will still return all results of that category
 */
export async function compendium_lookup_lid_plural(
  lid: string,
  short_circuit: boolean = true,
  types?: EntryType | EntryType[]
): Promise<Array<LancerActor | LancerItem>> {
  // Note: typeless lookup is (somewhat obviously) up to 13x more expensive than non
  if (!types) {
    types = Object.values(EntryType);
  } else if (!Array.isArray(types)) {
    types = [types];
  }

  let result: Array<LancerActor | LancerItem> = [];
  for (let t of types) {
    let pack = game.packs.get(`world.${t}`)!;
    await pack?.getDocuments({ lid: lid }).then(docs => {
      if (docs.length) {
        if (short_circuit) {
          return docs;
        } else {
          // @ts-expect-error TS2590
          result.push(...e);
        }
      }
    });
  }
  return result;
}

// As compendium_lookup_lid, but just takes first result
export async function compendium_lookup_lid(
  lid: string,
  types?: EntryType | EntryType[]
): Promise<LancerActor | LancerItem | null> {
  let res = await compendium_lookup_lid_plural(lid, true, types);
  if (res.length) {
    return res[0];
  } else {
    return null;
  }
}

// A fetcher cache for LIDs
export class LIDLookupCache extends FetcherCache<string, LancerActor | LancerItem | null> {
  constructor(timeout?: number) {
    super(key => compendium_lookup_lid(key), timeout);
  }
}