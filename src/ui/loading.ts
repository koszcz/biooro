// The loading screen shown while every GLB loads at boot. When loading ends, it turns into the title screen.
import { loadingText } from "../locales";
import { showTitle, type TitleChoice, type TitleOptions } from "./title";

export type LoadingScreen = {
  setProgress(share: number): void;
  /** Turns into the title screen. Resolves with the player's pick, and the screen goes away. */
  toTitle(options: TitleOptions): Promise<TitleChoice>;
};

export function showLoadingScreen(container: HTMLElement): LoadingScreen {
  const screen = document.createElement("div");
  screen.className = "loading-screen";
  screen.setAttribute("role", "progressbar");
  screen.setAttribute("aria-label", loadingText.label);
  Object.assign(screen.style, {
    position: "absolute",
    inset: "0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    background: "#2b3038",
    color: "#f3ece0",
    font: "600 18px system-ui, sans-serif",
  });
  const label = document.createElement("div");
  label.textContent = loadingText.label;
  const track = document.createElement("div");
  Object.assign(track.style, { width: "240px", height: "8px", borderRadius: "4px", background: "#454b55" });
  const bar = document.createElement("div");
  Object.assign(bar.style, { width: "0%", height: "100%", borderRadius: "4px", background: "#ff7a1a" });
  track.append(bar);
  screen.append(label, track);
  container.append(screen);
  return {
    setProgress(share) {
      const percent = Math.round(Math.min(Math.max(share, 0), 1) * 100);
      bar.style.width = `${percent}%`;
      screen.setAttribute("aria-valuenow", String(percent));
    },
    async toTitle(options) {
      const choice = await showTitle(screen, options);
      screen.remove();
      return choice;
    },
  };
}
