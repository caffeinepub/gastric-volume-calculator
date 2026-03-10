import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  FlaskConical,
  Info,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

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

interface Results {
  gsv: number;
  gsvPerKg: number;
  isHighRisk: boolean;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const csa = Number.parseFloat(values.csa);
  const age = Number.parseFloat(values.age);
  const weight = Number.parseFloat(values.weight);

  if (!values.csa.trim()) {
    errors.csa = "CSA is required";
  } else if (Number.isNaN(csa) || csa <= 0) {
    errors.csa = "CSA must be a positive number";
  }

  if (!values.age.trim()) {
    errors.age = "Age is required";
  } else if (Number.isNaN(age) || age <= 0 || !Number.isInteger(age)) {
    errors.age = "Age must be a positive whole number";
  }

  if (!values.weight.trim()) {
    errors.weight = "Weight is required";
  } else if (Number.isNaN(weight) || weight <= 0) {
    errors.weight = "Weight must be a positive number";
  }

  return errors;
}

export default function App() {
  const [values, setValues] = useState<FormValues>({
    csa: "",
    age: "",
    weight: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [results, setResults] = useState<Results | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function handleChange(field: keyof FormValues, value: string) {
    const next = { ...values, [field]: value };
    setValues(next);
    if (hasSubmitted) {
      setErrors(validate(next));
    }
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    setHasSubmitted(true);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const csa = Number.parseFloat(values.csa);
    const age = Number.parseFloat(values.age);
    const weight = Number.parseFloat(values.weight);

    const gsv = 27 + 14.6 * csa - 1.28 * age;
    const gsvPerKg = gsv / weight;
    const isHighRisk = gsvPerKg >= 1.5;

    setResults({ gsv, gsvPerKg, isHighRisk });
  }

  function handleReset() {
    setValues({ csa: "", age: "", weight: "" });
    setErrors({});
    setResults(null);
    setHasSubmitted(false);
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Background texture */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 10%, oklch(0.38 0.1 215 / 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 90%, oklch(0.52 0.14 155 / 0.04) 0%, transparent 50%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground leading-tight tracking-tight">
              Gastric Volume Calculator
            </h1>
            <p className="text-xs text-muted-foreground font-body">
              Pre-operative aspiration risk assessment
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 max-w-2xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Formula reference */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="rounded-lg border border-primary/20 bg-secondary/60 px-4 py-3 flex gap-3 items-start">
            <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm text-foreground/80 font-body">
              <span className="font-semibold text-foreground">Formula: </span>
              GV (ml) = 27 + (14.6 × CSA) − (1.28 × Age)
              <span className="text-muted-foreground ml-2">·</span>
              <span className="text-muted-foreground ml-2">
                High risk if GV/kg ≥ 1.5 ml/kg
              </span>
            </div>
          </div>
        </motion.div>

        {/* Input form */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
        >
          <Card className="shadow-card-lift border-border">
            <CardHeader className="pb-4">
              <CardTitle className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <Calculator className="w-4 h-4 text-primary" />
                Patient Parameters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} noValidate>
                <div className="grid gap-5">
                  {/* CSA */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="csa"
                      className="text-sm font-medium text-foreground"
                    >
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
                        className={`pr-12 font-body text-base ${errors.csa ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                        data-ocid="calculator.csa_input"
                        aria-describedby={errors.csa ? "csa-error" : "csa-hint"}
                        aria-invalid={!!errors.csa}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">
                        cm²
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      {errors.csa ? (
                        <motion.p
                          key="error"
                          id="csa-error"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs text-destructive flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {errors.csa}
                        </motion.p>
                      ) : (
                        <p
                          id="csa-hint"
                          className="text-xs text-muted-foreground"
                        >
                          Antral cross-sectional area from ultrasound
                        </p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Age */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="age"
                      className="text-sm font-medium text-foreground"
                    >
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
                        className={`pr-16 font-body text-base ${errors.age ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                        data-ocid="calculator.age_input"
                        aria-describedby={errors.age ? "age-error" : undefined}
                        aria-invalid={!!errors.age}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">
                        years
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      {errors.age && (
                        <motion.p
                          id="age-error"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs text-destructive flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {errors.age}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Weight */}
                  <div className="grid gap-1.5">
                    <Label
                      htmlFor="weight"
                      className="text-sm font-medium text-foreground"
                    >
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
                        className={`pr-8 font-body text-base ${errors.weight ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                        data-ocid="calculator.weight_input"
                        aria-describedby={
                          errors.weight ? "weight-error" : undefined
                        }
                        aria-invalid={!!errors.weight}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-medium">
                        kg
                      </span>
                    </div>
                    <AnimatePresence mode="wait">
                      {errors.weight && (
                        <motion.p
                          id="weight-error"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-xs text-destructive flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          {errors.weight}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-body font-semibold text-sm h-11 shadow-xs transition-all"
                      data-ocid="calculator.submit_button"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate GV
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleReset}
                      className="font-body font-medium text-sm h-11 border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                      data-ocid="calculator.reset_button"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              data-ocid="calculator.success_state"
            >
              <Card className="shadow-result border-border overflow-hidden">
                {/* Colored top stripe based on risk */}
                <div
                  className={`h-1.5 w-full ${results.isHighRisk ? "bg-destructive" : "bg-success"}`}
                />
                <CardHeader className="pb-2 pt-5">
                  <CardTitle className="font-display text-base font-semibold text-foreground">
                    Calculation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {/* GSV and GSV/kg row */}
                  <div className="grid grid-cols-2 gap-3">
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="rounded-lg bg-secondary/70 border border-border p-4"
                      data-ocid="calculator.gsv_result"
                    >
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                        Gastric Volume
                      </p>
                      <p className="font-display text-3xl font-semibold text-foreground leading-none">
                        {results.gsv.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 font-body">
                        ml
                      </p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                      className="rounded-lg bg-secondary/70 border border-border p-4"
                      data-ocid="calculator.gsv_per_kg_result"
                    >
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                        GV per kg
                      </p>
                      <p className="font-display text-3xl font-semibold text-foreground leading-none">
                        {results.gsvPerKg.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 font-body">
                        ml/kg
                      </p>
                    </motion.div>
                  </div>

                  {/* Risk assessment badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22, duration: 0.35 }}
                    data-ocid="calculator.risk_result"
                    className={`rounded-xl border-2 p-5 flex items-start gap-4 ${
                      results.isHighRisk
                        ? "bg-destructive/8 border-destructive/40"
                        : "bg-success/8 border-success/40"
                    }`}
                    style={{
                      backgroundColor: results.isHighRisk
                        ? "oklch(0.52 0.22 25 / 0.07)"
                        : "oklch(0.52 0.18 155 / 0.07)",
                      borderColor: results.isHighRisk
                        ? "oklch(0.52 0.22 25 / 0.35)"
                        : "oklch(0.52 0.18 155 / 0.35)",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: results.isHighRisk
                          ? "oklch(0.52 0.22 25 / 0.15)"
                          : "oklch(0.52 0.18 155 / 0.15)",
                      }}
                    >
                      {results.isHighRisk ? (
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
                          color: results.isHighRisk
                            ? "oklch(0.42 0.22 25)"
                            : "oklch(0.32 0.18 155)",
                        }}
                      >
                        {results.isHighRisk
                          ? "High Risk of Aspiration"
                          : "Low Risk of Aspiration"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 font-body leading-relaxed">
                        {results.isHighRisk ? (
                          <>
                            GV/kg of{" "}
                            <strong className="text-foreground">
                              {results.gsvPerKg.toFixed(2)} ml/kg
                            </strong>{" "}
                            exceeds the 1.5 ml/kg threshold. Consider
                            appropriate precautions before anaesthesia.
                          </>
                        ) : (
                          <>
                            GV/kg of{" "}
                            <strong className="text-foreground">
                              {results.gsvPerKg.toFixed(2)} ml/kg
                            </strong>{" "}
                            is below the 1.5 ml/kg threshold. Standard
                            anaesthetic precautions apply.
                          </>
                        )}
                      </p>
                    </div>
                  </motion.div>

                  {/* Threshold reference */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    <span>
                      Threshold: GV/kg ≥ 1.5 ml/kg = High risk · GV/kg &lt; 1.5
                      ml/kg = Low risk
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clinical disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-xs text-muted-foreground text-center px-4 leading-relaxed"
        >
          This calculator is intended as a clinical decision support tool.
          Always apply clinical judgement and local institutional guidelines
          when assessing aspiration risk.
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-card/60 py-4">
        <p className="text-center text-xs text-muted-foreground font-body">
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
    </div>
  );
}
