import { Match, Switch, createSignal, onCleanup } from "solid-js";
import { events, addNumbers } from "tauri-specta-custom-plugin";
import * as bindings from "./bindings"

function App() {
  const [latestNumber, setLatestNumber] = createSignal<number | null>(null);
  const [latestLetter, setLatestLetter] = createSignal<string | null>(null);

  const [generatedNumber, setGeneratedNumber] = createSignal<
    { type: "loading" } | { type: "loaded"; value: number } | null
  >(null);

  events.randomNumber
    .listen((e) => setLatestNumber(e.payload))
    .then((unlisten) => onCleanup(unlisten));

    bindings.events.randomLetter
    .listen((e) => setLatestLetter(e.payload))
    .then((unlisten) => onCleanup(unlisten));

  return (
    <div>
        <p>Latest Random letter: {latestLetter()}</p>
      <p>Latest Random Number: {latestNumber()}</p>
      <button
        disabled={generatedNumber()?.type === "loading"}
        onClick={() => {
          setGeneratedNumber({ type: "loading" });

          addNumbers(
            Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 10)
          )
            .then((value) => setGeneratedNumber({ type: "loaded", value }))
            .catch(() => setGeneratedNumber(null));
        }}
      >
        Generate Random Number
      </button>
      <Switch fallback="Generate a number!">
        <Match when={generatedNumber()?.type === "loading"}>
          Loading number...
        </Match>
        <Match
          when={(() => {
            const n = generatedNumber();
            return n?.type === "loaded" && n.value;
          })()}
        >
          {(value) => value()}
        </Match>
      </Switch>
    </div>
  );
}

export default App;
