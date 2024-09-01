import esDictionary from "@/dictionaries/es.json";

export type Dictionary = typeof esDictionary;

export async function getDictionary(): Promise<Dictionary> {
  return esDictionary;
}