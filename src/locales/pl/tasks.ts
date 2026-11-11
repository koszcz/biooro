// Polish Task wording, keyed by Task ID. The type checker fails if a Task has no wording.
// The seat is "deska Smart", so the Polish text calls it "ona". Lines to the Intern avoid gendered verb forms.
import type * as en from "../en/tasks";
import type { Strings } from "../strings";

export const STRANGE_TASK_WORDING: Strings<typeof en.STRANGE_TASK_WORDING> = {
  "tue-strange":
    "Klientka pisze, że deska Smart przywitała ją po imieniu. Sprawdź, czy deska w Pokoju 4 ma opcję „powitanie”.",
  "wed-strange": "Pewien pan pisze, że deska Smart kazała mu „pić więcej wody”. Mieszka sam. Odpisz mu.",
  "thu-strange": "Od dziewiątej drukarka drukuje na każdej stronie tętno spoczynkowe obcej osoby. Niech przestanie.",
};

export const TASK_WORDING: Strings<typeof en.TASK_WORDING> = {
  "mon-zbigniew": "Wydrukuj nam pięćdziesiąt nowych formularzy chwili feedbacku, dobrze? Cudowny odcień beżu.",
  "mon-anyone": "Umyj kubki działu. W jednym na dnie przyschła torebka herbaty.",
  "tue-halina": "Odłóż reklamacje serii Smart z zeszłego tygodnia na półkę z dowodami. Parafuj każdą stronę. Do akt.",
  "tue-zbigniew": "Dajmy tym starym chwilom feedbacku o serii Smart nowy start. Niszczarka stoi tuż obok.",
  "tue-anyone": "Podlej roślinę przy oknie. Nikt nie pamięta, czyja jest.",
  "wed-kamil":
    "Wydrukuj te czterdzieści reklamacji do mojego segregatora. Przeczytaj je. Wszystkie mówią, że deska była ciepła, zanim ktoś usiadł.",
  "wed-wiola":
    "Przetrzyj, proszę, deskę Smart w Pokoju 4 przed pokazem. Aha, i wszystkiego najlepszego z okazji prawie urodzin!",
  "wed-ryszard":
    "Zamknij te trzydzieści reklamacji serii Smart Szablonem 12. Nie czytaj ich. Czytanie tylko spowalnia.",
  "thu-halina":
    "Podpisz to oświadczenie, że Pan Zbigniew został ostrzeżony. Potem odłóż je na półkę do pozostałych. Do akt.",
  "thu-zbigniew": "Wspaniałe wieści! Teczka Pani Haliny jest gotowa do recyklingu. Niszczarka, jak znajdziesz chwilę.",
  "thu-kamil": "Przetestuj ze mną deskę w Pokoju 4. Usiądź, nic nie mów i zapisz, co ona odpowie.",
  "thu-anyone": "Roślina przy oknie odwróciła się w stronę Pokoju 4. Odwróć ją z powrotem.",
  "fri-zbigniew":
    "Dziś dla Centrali wszystko jest idealne. Wszystko. Opróżnij, proszę, szufladę z reklamacjami do niszczarki.",
  "fri-halina": "Spakuj półkę z dowodami dla Centrali. Jeśli ktoś zapyta, pakowanie to twoja robota. Nie moja.",
  "fri-wiola": "Zrób dla Centrali piękny Pokój 4. Deska poprosiła o świeże kwiaty. Zdradziła mi twoje ulubione.",
  "fri-ryszard": "Wydrukuj dla Centrali Szablon 1. Jest w nim „Nie stwierdzono problemów”. Od dziewiętnastu lat.",
};

export const FALLOUT_WORDING: Strings<typeof en.FALLOUT_WORDING> = {
  "mon-zbigniew.fallout":
    "Nasze formularze chwili feedbacku wyszły puste! Co za świetna okazja, żeby wydrukować wszystkie pięćdziesiąt jeszcze raz.",
  "mon-anyone.fallout": "Kubki wróciły, a na torebce herbaty coś wyrosło. Tym razem wyszoruj porządnie każdy kubek.",
  "tue-halina.fallout":
    "Reklamacje serii Smart z zeszłego tygodnia nie trafiły na półkę. Odnotowałam to. Odłóż je teraz i parafuj każdą stronę dwa razy.",
  "tue-zbigniew.fallout":
    "Te chwile feedbacku o serii Smart do nas wróciły! Zniszczmy je jeszcze raz, powoli i dokładnie.",
  "tue-anyone.fallout": "Roślina przy oknie usycha. Tym razem podlej ją porządnie. Może ją też przeproś.",
  "wed-kamil.fallout":
    "W moim segregatorze brakuje czterdziestu stron. Nikt ich nie wydrukował. Wydrukuj je jeszcze raz i tym razem przeczytaj.",
  "wed-wiola.fallout":
    "Deska na pokaz w Pokoju 4 była lepka. Powiedziała mi, że czuje się urażona. Wyczyść ją porządnie, proszę, dla nas obu.",
  "wed-ryszard.fallout": "Tamte trzydzieści reklamacji wróciło otwarte. Znowu Szablon 12, ale każdą podpisz odręcznie.",
  "tue-strange.fallout":
    "Klientka znowu pisze. Jej deska Smart wita teraz po imieniu także gości. Sprawdź jeszcze raz deskę w Pokoju 4.",
  "wed-strange.fallout":
    "Znowu pisze pan, który mieszka sam. Deska Smart dziękuje mu teraz, że pije więcej wody. Odpisz mu porządnie.",
  "thu-strange.fallout":
    "Drukarka znowu drukuje tętno obcej osoby. Teraz jest szybsze. Tym razem napraw drukarkę porządnie.",
};
