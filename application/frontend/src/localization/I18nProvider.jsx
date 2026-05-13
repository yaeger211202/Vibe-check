import { createContext, useContext, useEffect, useMemo } from "react";
import en from "./messages/en.js";

const catalogs = { en };
const I18nContext = createContext(null);

function getMessage(locale, key) {
    return key.split(".").reduce((value, segment) => value?.[segment], catalogs[locale]);
}

function interpolate(template, values = {}) {
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? `{${key}}`);
}

export function I18nProvider({ children }) {
    const locale = "en";

    useEffect(() => {
        document.documentElement.lang = "en";
    }, []);

    const value = useMemo(() => ({
        locale,
        t(key, values) {
            const message = getMessage(locale, key);
            return typeof message === "string" ? interpolate(message, values) : key;
        },
        tm(key) {
            return getMessage(locale, key);
        },
    }), [locale]);

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error("useI18n must be used within an I18nProvider.");
    }
    return context;
}
