"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ExpenseFormData, IncomeFormData, PersonalFormData } from "@/lib/validators/wizard";

export type AutosaveStatus = "idle" | "saving" | "saved";

export interface WizardState {
  personal: PersonalFormData | null;
  incomes: IncomeFormData[];
  expenses: ExpenseFormData[];
  emergencyFund: { targetMonths: number; currentAmount: number };
}

const STORAGE_KEY = "finance-ai:wizard:v1";

const DEFAULT_STATE: WizardState = {
  personal: null,
  incomes: [],
  expenses: [],
  emergencyFund: { targetMonths: 6, currentAmount: 0 },
};

interface WizardContextValue {
  state: WizardState;
  autosaveStatus: AutosaveStatus;
  setPersonal: (data: PersonalFormData) => void;
  setIncomes: (incomes: IncomeFormData[]) => void;
  setExpenses: (expenses: ExpenseFormData[]) => void;
  setEmergencyFund: (data: { targetMonths: number; currentAmount: number }) => void;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

function loadFromStorage(): WizardState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<WizardState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WizardState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratação client-only a partir do localStorage; não existe estado equivalente no servidor
    setState(loadFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reflete no indicador de UI que um debounce de escrita em disco começou
    setAutosaveStatus("saving");
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setAutosaveStatus("saved");
    }, 400);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [state, hydrated]);

  const setPersonal = useCallback((data: PersonalFormData) => {
    setState((prev) => ({ ...prev, personal: data }));
  }, []);

  const setIncomes = useCallback((incomes: IncomeFormData[]) => {
    setState((prev) => ({ ...prev, incomes }));
  }, []);

  const setExpenses = useCallback((expenses: ExpenseFormData[]) => {
    setState((prev) => ({ ...prev, expenses }));
  }, []);

  const setEmergencyFund = useCallback(
    (data: { targetMonths: number; currentAmount: number }) => {
      setState((prev) => ({ ...prev, emergencyFund: data }));
    },
    [],
  );

  const resetWizard = useCallback(() => {
    setState(DEFAULT_STATE);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<WizardContextValue>(
    () => ({
      state,
      autosaveStatus,
      setPersonal,
      setIncomes,
      setExpenses,
      setEmergencyFund,
      resetWizard,
    }),
    [state, autosaveStatus, setPersonal, setIncomes, setExpenses, setEmergencyFund, resetWizard],
  );

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard deve ser usado dentro de <WizardProvider>.");
  return ctx;
}
