// The title screen, which the loading screen turns into: Continue and New game.
import { LANGUAGE_KEY, LANGUAGE_SWITCH, titleText } from "../locales/index";
import { button, el } from "./dom";

export type TitleChoice = "continue" | "newGame";

export interface TitleOptions {
  /** True when the slot holds a save. Without one, Continue is gone and New game needs no confirmation. */
  canContinue: boolean;
}

/** Replaces the contents of `screen` with the title screen. Resolves with the player's pick. */
export function showTitle(screen: HTMLElement, options: TitleOptions): Promise<TitleChoice> {
  return new Promise((resolve) => {
    const pick = (choice: TitleChoice) => resolve(choice);
    const heading = el("div", "", titleText.gameTitle);
    heading.style.font = "700 48px system-ui, sans-serif";
    const row = el("div");
    Object.assign(row.style, { display: "flex", gap: "12px" });

    const menu = () => {
      const buttons = [];
      if (options.canContinue) buttons.push(button(titleText.continueButton, () => pick("continue")));
      buttons.push(button(titleText.newGameButton, () => (options.canContinue ? confirm() : pick("newGame"))));
      row.replaceChildren(...buttons.map(styled));
      screen.replaceChildren(heading, row, languageButton());
    };
    const confirm = () => {
      row.replaceChildren(
        styled(button(titleText.newGameConfirmYes, () => pick("newGame"))),
        styled(button(titleText.newGameConfirmNo, menu)),
      );
      screen.replaceChildren(heading, el("div", "", titleText.newGameConfirm), row);
    };
    screen.removeAttribute("role");
    screen.removeAttribute("aria-valuenow");
    screen.removeAttribute("aria-label");
    menu();
  });
}

/** Saves the other language and reloads, since every string table is picked at load. A `?lang=` query is dropped. */
function languageButton(): HTMLButtonElement {
  const node = button(LANGUAGE_SWITCH.label, () => {
    window.localStorage.setItem(LANGUAGE_KEY, LANGUAGE_SWITCH.to);
    const url = new URL(window.location.href);
    url.searchParams.delete("lang");
    window.location.replace(url);
  });
  Object.assign(node.style, {
    font: "14px system-ui, sans-serif",
    background: "none",
    border: "0",
    color: "inherit",
    textDecoration: "underline",
    cursor: "pointer",
  });
  return node;
}

function styled(node: HTMLButtonElement): HTMLButtonElement {
  Object.assign(node.style, {
    font: "600 18px system-ui, sans-serif",
    padding: "10px 22px",
    borderRadius: "8px",
    border: "0",
    cursor: "pointer",
    background: "#ff7a1a",
    color: "#fff",
  });
  return node;
}
