import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Info,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCalculateAndSave, useUserCalculations } from "./hooks/useQueries";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / 1_000_000n);
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(ms));
}

// ── Calculator Form ───────────────────────────────────────────────────────────

interface FormValues {
  csa: string;
  age: string;
  weight: string;
}

interface FormErrors {
  csa?: string;
  age?: string;
  weight?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const csa = Number.parseFloat(values.csa);
  const age = Number.parseFloat(values.age);
  const weight = Number.parseFloat(values.weight);

  if (!values.csa.trim()) errors.csa = "CSA is required";
  else if (Number.isNaN(csa) || csa <= 0)
    errors.csa = "Must be a positive number";

  if (!values.age.trim()) errors.age = "Age is required";
  else if (Number.isNaN(age) || age <= 0 || !Number.isInteger(age))
    errors.age = "Must be a positive whole number";

  if (!values.weight.trim()) errors.weight = "Weight is required";
  else if (Number.isNaN(weight) || weight <= 0)
    errors.weight = "Must be a positive number";

  return errors;
}

function CalculatorTab() {
  const [values, setValues] = useState<FormValues>({
    csa: "",
    age: "",
    weight: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const calculateMutation = useCalculateAndSave();

  function handleChange(field: keyof FormValues, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (hasSubmitted) setErrors(validate(next));
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setHasSubmitted(true);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    calculateMutation.mutate(
      {
        csa: Number.parseFloat(values.csa),
        age: BigInt(Math.round(Number.parseFloat(values.age))),
        weight: Number.parseFloat(values.weight),
      },
      {
        onError: () => toast.error("Calculation failed. Please try again."),
      },
    );
  }

  function handleReset() {
    setValues({ csa: "", age: "", weight: "" });
    setErrors({});
    setHasSubmitted(false);
    calculateMutation.reset();
  }

  const result = calculateMutation.data;

  return (
    <div className="space-y-5">
      {/* Formula reference */}
      <div className="rounded-lg border border-primary/20 bg-secondary/60 px-4 py-3 flex gap-3 items-start">
        <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <div className="text-sm text-foreground/80">
          <span className="font-semibold text-foreground">Formula: </span>
          GV (ml) = 27 + (14.6 × CSA) − (1.28 × Age)
          <span className="text-muted-foreground mx-2">·</span>
          <span className="text-muted-foreground">
            High risk if GV/kg ≥ 1.5 ml/kg
          </span>
        </div>
      </div>

      {/* Input form */}
      <Card className="shadow-card-lift">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calculator className="w-4 h-4 text-primary" />
            Patient Parameters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCalculate} noValidate>
            <div className="grid gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="csa" className="text-sm font-medium">
                  Cross Sectional Area (CSA)
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    cm²
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="csa"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 3.5"
                    value={values.csa}
                    onChange={(e) => handleChange("csa", e.target.value)}
                    className={`pr-12 text-base ${errors.csa ? "border-destructive" : ""}`}
                    data-ocid="calculator.input"
                    aria-invalid={!!errors.csa}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    cm²
                  </span>
                </div>
                {errors.csa && (
                  <p
                    className="text-xs text-destructive flex items-center gap-1"
                    data-ocid="calculator.error_state"
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {errors.csa}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="age" className="text-sm font-medium">
                  Patient Age
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    years
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="e.g. 45"
                    value={values.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className={`pr-14 text-base ${errors.age ? "border-destructive" : ""}`}
                    data-ocid="calculator.input"
                    aria-invalid={!!errors.age}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    yrs
                  </span>
                </div>
                {errors.age && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.age}
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="weight" className="text-sm font-medium">
                  Patient Weight
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    kg
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 70"
                    value={values.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    className={`pr-8 text-base ${errors.weight ? "border-destructive" : ""}`}
                    data-ocid="calculator.input"
                    aria-invalid={!!errors.weight}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
                    kg
                  </span>
                </div>
                {errors.weight && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {errors.weight}
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 h-11 font-semibold"
                  disabled={calculateMutation.isPending}
                  data-ocid="calculator.submit_button"
                >
                  {calculateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="w-4 h-4 mr-2" />
                  )}
                  {calculateMutation.isPending
                    ? "Calculating…"
                    : "Calculate GV"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  className="h-11"
                  data-ocid="calculator.secondary_button"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            data-ocid="calculator.success_state"
          >
            <Card className="shadow-result overflow-hidden">
              <div
                className={`h-1.5 w-full ${
                  result.highRisk ? "bg-destructive" : "bg-success"
                }`}
              />
              <CardHeader className="pb-2 pt-5">
                <CardTitle className="font-display text-base font-semibold">
                  Calculation Results
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/70 border border-border p-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      Gastric Volume
                    </p>
                    <p className="font-display text-3xl font-semibold text-foreground leading-none">
                      {result.gv.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">ml</p>
                  </div>
                  <div className="rounded-lg bg-secondary/70 border border-border p-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                      GV per kg
                    </p>
                    <p className="font-display text-3xl font-semibold text-foreground leading-none">
                      {result.gvPerKg.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">ml/kg</p>
                  </div>
                </div>

                <div
                  className="rounded-xl border-2 p-5 flex items-start gap-4"
                  style={{
                    backgroundColor: result.highRisk
                      ? "oklch(0.52 0.22 25 / 0.07)"
                      : "oklch(0.52 0.18 155 / 0.07)",
                    borderColor: result.highRisk
                      ? "oklch(0.52 0.22 25 / 0.35)"
                      : "oklch(0.52 0.18 155 / 0.35)",
                  }}
                  data-ocid="calculator.card"
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      backgroundColor: result.highRisk
                        ? "oklch(0.52 0.22 25 / 0.15)"
                        : "oklch(0.52 0.18 155 / 0.15)",
                    }}
                  >
                    {result.highRisk ? (
                      <AlertTriangle
                        className="w-5 h-5"
                        style={{ color: "oklch(0.52 0.22 25)" }}
                      />
                    ) : (
                      <CheckCircle2
                        className="w-5 h-5"
                        style={{ color: "oklch(0.42 0.18 155)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-display text-lg font-semibold leading-tight"
                      style={{
                        color: result.highRisk
                          ? "oklch(0.42 0.22 25)"
                          : "oklch(0.32 0.18 155)",
                      }}
                    >
                      {result.highRisk
                        ? "High Risk of Aspiration"
                        : "Low Risk of Aspiration"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      GV/kg of{" "}
                      <strong className="text-foreground">
                        {result.gvPerKg.toFixed(2)} ml/kg
                      </strong>{" "}
                      {result.highRisk
                        ? "exceeds the 1.5 ml/kg threshold. Consider appropriate precautions before anaesthesia."
                        : "is below the 1.5 ml/kg threshold. Standard anaesthetic precautions apply."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── History Tab ───────────────────────────────────────────────────────────────

function HistoryTab() {
  const { data: calculations, isLoading } = useUserCalculations();

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center py-16 gap-3 text-muted-foreground"
        data-ocid="history.loading_state"
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading history…
      </div>
    );
  }

  const sorted = [...(calculations ?? [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  if (sorted.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground"
        data-ocid="history.empty_state"
      >
        <ClipboardList className="w-10 h-10 opacity-30" />
        <p className="text-sm">
          No calculations yet. Use the calculator to get started.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[600px]">
      <div className="space-y-3">
        {sorted.map((calc, i) => (
          <motion.div
            key={Number(calc.timestamp)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            data-ocid={`history.item.${i + 1}`}
          >
            <Card className="border-border">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge
                        variant={calc.highRisk ? "destructive" : "default"}
                        className={
                          calc.highRisk
                            ? ""
                            : "bg-success text-white hover:bg-success/90"
                        }
                      >
                        {calc.highRisk ? "High Risk" : "Low Risk"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(calc.timestamp)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">CSA</p>
                        <p className="font-medium">{calc.csa.toFixed(2)} cm²</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Age</p>
                        <p className="font-medium">{calc.age.toString()} yrs</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="font-medium">
                          {calc.weight.toFixed(1)} kg
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                      GV / GV per kg
                    </p>
                    <p className="font-display font-semibold text-lg text-foreground leading-tight">
                      {calc.gv.toFixed(1)} ml
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {calc.gvPerKg.toFixed(2)} ml/kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
}

// ── Precautions Tab ───────────────────────────────────────────────────────────

const PRECAUTIONS = [
  {
    title: "Provides only an estimate",
    body: "Gastric volume calculators approximate volume from antral measurements and may not reflect the true gastric content.",
  },
  {
    title: "Validated only in selected populations",
    body: (
      <>
        Accuracy may be reduced in{" "}
        <strong>
          pregnancy, obesity, pediatrics, or critically ill patients
        </strong>
        .
      </>
    ),
  },
  {
    title: "Patient position affects calculation",
    body: (
      <>
        Most formulas are validated in the{" "}
        <strong>right lateral decubitus position</strong>; other positions may
        give inaccurate values.
      </>
    ),
  },
  {
    title: "Operator dependent measurement",
    body: (
      <>
        Incorrect identification or tracing of the{" "}
        <strong>gastric antrum</strong> can significantly alter the calculated
        volume.
      </>
    ),
  },
  {
    title: "Volume threshold is not absolute",
    body: (
      <>
        Suggested cut-offs (e.g., <strong>&gt;1.5 mL/kg</strong>) indicate
        possible risk but{" "}
        <strong>do not definitively predict aspiration</strong>.
      </>
    ),
  },
  {
    title: "Clinical context must guide decisions",
    body: (
      <>
        Gastric volume estimates should{" "}
        <strong>
          supplement, not replace clinical judgment and aspiration precautions
        </strong>
        .
      </>
    ),
  },
];

function PrecautionsTab() {
  return (
    <div className="space-y-3" data-ocid="precautions.panel">
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 flex gap-3 items-start">
        <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-foreground/80">
          Review these precautions before interpreting calculator results in
          clinical practice.
        </p>
      </div>

      {PRECAUTIONS.map((item, i) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          data-ocid={`precautions.item.${i + 1}`}
        >
          <Card className="border-border">
            <CardContent className="pt-4 pb-4">
              <div className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 10%, oklch(0.38 0.1 215 / 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 90%, oklch(0.52 0.14 155 / 0.04) 0%, transparent 50%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-base font-semibold text-foreground leading-tight tracking-tight">
              Gastric Volume Calculator
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Pre-operative aspiration risk assessment
            </p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Tabs defaultValue="calculator">
          <TabsList className="mb-5 w-full" data-ocid="app.tab">
            <TabsTrigger
              value="calculator"
              className="flex-1"
              data-ocid="app.tab"
            >
              <Calculator className="w-3.5 h-3.5 mr-1.5" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1" data-ocid="app.tab">
              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
              History
            </TabsTrigger>
            <TabsTrigger
              value="precautions"
              className="flex-1"
              data-ocid="app.tab"
            >
              <ShieldAlert className="w-3.5 h-3.5 mr-1.5" />
              Precautions
            </TabsTrigger>
          </TabsList>
          <TabsContent value="calculator">
            <CalculatorTab />
          </TabsContent>
          <TabsContent value="history">
            <HistoryTab />
          </TabsContent>
          <TabsContent value="precautions">
            <PrecautionsTab />
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center px-4 leading-relaxed mt-6">
          This calculator is intended as a clinical decision support tool.
          Always apply clinical judgement and local institutional guidelines.
        </p>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/60 py-4">
        <p className="text-center text-xs text-muted-foreground">
          © {currentYear}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors underline underline-offset-2"
          >
            Built with ♥ using caffeine.ai
          </a>
        </p>
      </footer>

      <Toaster />
    </div>
  );
}
