// The title screen, which the loading screen turns into: Continue and New game.
import { titleText } from "../locales/index";
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
      screen.replaceChildren(heading, row);
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
