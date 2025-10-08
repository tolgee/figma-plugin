import { components } from "@tginternal/client";
import en from "../import-data/examples/en.json";
import fr from "../import-data/examples/fr.json";
import cs from "../import-data/examples/cs.json";
import de from "../import-data/examples/de.json";

const keys = Object.keys(en) as Array<keyof typeof en>;
export const EXAMPLE_PROJECT: components["schemas"]["SingleStepImportResolvableRequest"] =
  {
    keys: keys.map((name) => ({
      name,
      translations: {
        en: { text: en[name] },
        fr: { text: fr[name] },
        cs: { text: cs[name] },
        de: { text: de[name] },
      },
    })),
  };
