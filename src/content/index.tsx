import { createRoot } from "react-dom/client";
import { ContentApp } from "./ContentApp";
import "./banner.css";

const ROOT_ID = "wew-root";

function mount() {
  if (document.getElementById(ROOT_ID)) return;

  const host = document.createElement("div");
  host.id = ROOT_ID;

  const attach = () => {
    document.documentElement.prepend(host);
    createRoot(host).render(<ContentApp />);
  };

  if (document.documentElement) {
    attach();
    return;
  }

  const observer = new MutationObserver(() => {
    if (document.documentElement) {
      observer.disconnect();
      attach();
    }
  });
  observer.observe(document, { childList: true });
}

mount();
