import { create } from "zustand";
import type { Corpse, Edition } from "./edition-types";
import { demoCorpses, demoEdition } from "./seed-edition";

type EditionState = {
  edition: Edition;
  corpses: Corpse[];
  setEdition: (edition: Edition) => void;
  setCorpses: (corpses: Corpse[]) => void;
};

export const useEditionStore = create<EditionState>((set) => ({
  edition: demoEdition,
  corpses: demoCorpses,
  setEdition: (edition) => set({ edition }),
  setCorpses: (corpses) => set({ corpses }),
}));
