import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Calculation } from "../backend";

export function useCalculateAndSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      csa,
      age,
      weight,
    }: {
      csa: number;
      age: bigint;
      weight: number;
    }): Promise<Calculation> => {
      const ageNum = Number(age);
      const gv = 27 + 14.6 * csa - 1.28 * ageNum;
      const gvPerKg = gv / weight;
      const highRisk = gvPerKg >= 1.5;
      const result: Calculation = {
        csa,
        age,
        weight,
        gv,
        gvPerKg,
        highRisk,
        timestamp: BigInt(Date.now()) * 1_000_000n,
      };
      // Persist to localStorage
      const existing = JSON.parse(
        localStorage.getItem("gv_history") ?? "[]",
      ) as object[];
      existing.unshift({
        ...result,
        age: result.age.toString(),
        timestamp: result.timestamp.toString(),
      });
      localStorage.setItem(
        "gv_history",
        JSON.stringify(existing.slice(0, 100)),
      );
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calculations"] });
    },
  });
}

export function useUserCalculations() {
  const raw = JSON.parse(localStorage.getItem("gv_history") ?? "[]") as Array<{
    csa: number;
    age: string;
    weight: number;
    gv: number;
    gvPerKg: number;
    highRisk: boolean;
    timestamp: string;
  }>;
  const data: import("../backend").Calculation[] = raw.map((r) => ({
    ...r,
    age: BigInt(r.age),
    timestamp: BigInt(r.timestamp),
  }));
  return { data, isLoading: false };
}
