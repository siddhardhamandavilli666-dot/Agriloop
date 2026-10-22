import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { translateText } from "./translations";

const LanguageContext = createContext(null);
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const LOCALIZED_ATTRIBUTES = ["placeholder", "title", "aria-label"];

function localizeDocument(root, language) {
  if (!root) {
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;

  while ((node = walker.nextNode())) {
    if (
      !node.nodeValue?.trim() ||
      node.parentElement?.closest("script, style, svg, .language-toggle")
    ) {
      continue;
    }

    const current = node.nodeValue;
    const record = originalText.get(node);
    const source =
      !record || current !== record.lastRendered ? current : record.original;
    const translated = translateText(source, language);
    originalText.set(node, { original: source, lastRendered: translated });

    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  root.querySelectorAll("*").forEach((element) => {
    if (element.closest(".language-toggle")) {
      return;
    }

    LOCALIZED_ATTRIBUTES.forEach((attribute) => {
      if (!element.hasAttribute(attribute)) {
        return;
      }

      let record = originalAttributes.get(element);
      if (!record) {
        record = {};
        originalAttributes.set(element, record);
      }

      const current = element.getAttribute(attribute);
      const saved = record[attribute];
      const source =
        !saved || current !== saved.lastRendered ? current : saved.original;
      const translated = translateText(source, language);
      record[attribute] = { original: source, lastRendered: translated };

      if (current !== translated) element.setAttribute(attribute, translated);
    });
  });
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("agriloop-language") || "en",
  );

  const toggleLanguage = useCallback(() => {
    setLanguage((current) => (current === "en" ? "te" : "en"));
  }, []);

  useEffect(() => {
    localStorage.setItem("agriloop-language", language);
    document.documentElement.lang = language === "te" ? "te" : "en";
    document.title =
      language === "te"
        ? "AgriLoop | వ్యవసాయ యంత్రాల అద్దె"
        : "AgriLoop | Machinery Rental";
    const root = document.getElementById("root");
    localizeDocument(root, language);
    const observer = new MutationObserver(() =>
      localizeDocument(root, language),
    );
    if (root) {
      observer.observe(root, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: LOCALIZED_ATTRIBUTES,
      });
    }

    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(
    () => ({ language, toggleLanguage }),
    [language, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
