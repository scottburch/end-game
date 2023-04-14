import { bind } from "@react-rxjs/core"
import { createSignal } from "@react-rxjs/utils"

// A signal is an entry point to react-rxjs. It's equivalent to using a subject
export const [menuOpenChange$, setMenuOpen] = createSignal<boolean>();
export const [useIsMenuOpen] = bind(menuOpenChange$, false);


