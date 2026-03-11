import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SignupState {
  // Auth
  firebaseUid: string | null;
  userId: string | null;
  email: string;
  authMethod: "google" | "apple" | "email" | null;
  isNewUser: boolean;

  // Account type (set on decision screen)
  accountType: "company" | "join" | null;

  // Profile (About You — step 2)
  firstName: string;
  lastName: string;
  phone: string;
  companyName: string;

  // Details (step 3)
  industries: string[];
  companySize: string;
  companyAge: string;

  // Company
  companyId: string | null;

  // Progress
  currentStep: number; // 1=credentials, 2=profile, 3=details

  // Actions
  setAuth: (data: {
    firebaseUid: string;
    userId: string;
    email: string;
    authMethod: "google" | "apple" | "email";
    isNewUser: boolean;
  }) => void;
  setProfile: (data: {
    firstName: string;
    lastName: string;
    phone: string;
    companyName: string;
  }) => void;
  setDetails: (data: {
    industries: string[];
    companySize: string;
    companyAge: string;
  }) => void;
  setAccountType: (type: "company" | "join") => void;
  setCompanyId: (id: string) => void;
  setCurrentStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  firebaseUid: null as string | null,
  userId: null as string | null,
  email: "",
  authMethod: null as SignupState["authMethod"],
  isNewUser: false,
  accountType: null as SignupState["accountType"],
  firstName: "",
  lastName: "",
  phone: "",
  companyName: "",
  industries: [] as string[],
  companySize: "",
  companyAge: "",
  companyId: null as string | null,
  currentStep: 1,
};

export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (data) =>
        set({
          firebaseUid: data.firebaseUid,
          userId: data.userId,
          email: data.email,
          authMethod: data.authMethod,
          isNewUser: data.isNewUser,
        }),

      setProfile: (data) =>
        set({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          companyName: data.companyName,
        }),

      setDetails: (data) =>
        set({
          industries: data.industries,
          companySize: data.companySize,
          companyAge: data.companyAge,
        }),

      setAccountType: (type) => set({ accountType: type }),
      setCompanyId: (id) => set({ companyId: id }),
      setCurrentStep: (step) => set({ currentStep: step }),
      reset: () => set(initialState),
    }),
    {
      name: "ops-signup",
    }
  )
);
