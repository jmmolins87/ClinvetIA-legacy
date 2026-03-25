/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Icon } from "@/components/ui/icon";
import { useRoi, type ClinicType } from "@/features/roi";
import { useMounted } from "@/hooks/use-mounted";
import { SiteFooter } from '@/components/blocks/site-footer';

const CLINIC_TYPES: { id: ClinicType; icon: string; color: string }[] = [
  { id: "small", icon: "Home", color: "from-pink-500 via-fuchsia-600 to-pink-600 dark:from-green-500 dark:via-pink-500 dark:to-fuchsia-500" },
  { id: "medium", icon: "Store", color: "from-green-500 via-emerald-600 to-green-600 dark:from-green-500 dark:via-emerald-500 dark:to-green-500" },
  { id: "large", icon: "Building", color: "from-purple-500 via-pink-600 to-purple-600 dark:from-purple-500 dark:via-pink-500 dark:to-purple-500" },
  { id: "specialized", icon: "Building2", color: "from-orange-500 via-amber-600 to-orange-600 dark:from-orange-500 dark:via-amber-500 dark:to-orange-500" },
];

export default function ROIPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const mounted = useMounted();
  
  // Use ROI hook (new logic)
  const {
    inputs,
    results,
    hasData,
    hasAcceptedData,
    setClinicType,
    setMonthlyPatients,
    setAvgTicket,
    setMissedRate,
    acceptData,
    clearData,
  } = useRoi();
  
  // Modal states
  const [showAcceptDialog, setShowAcceptDialog] = React.useState(false);
  const [showIncompleteDialog, setShowIncompleteDialog] = React.useState(false);
  const [pendingNavigation, setPendingNavigation] = React.useState<string | null>(null);
  const [shouldBlockNavigation, setShouldBlockNavigation] = React.useState(true);
  
  // Check if data is complete (for incomplete modal)
  const isDataComplete = React.useCallback(() => {
    return inputs.clinicType && inputs.monthlyPatients > 0 && inputs.avgTicket > 0 && inputs.missedRate > 0;
  }, [inputs]);
  
  // Intercept navigation if data not accepted
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!shouldBlockNavigation || hasAcceptedData) return;
      
      const target = e.target as HTMLElement;
      const link = target.closest("a");
      
      if (link && link.href && !link.href.includes("/roi")) {
        // User has data but hasn't accepted it
        if (hasData && !hasAcceptedData) {
          e.preventDefault();
          e.stopPropagation();
          setPendingNavigation(link.href);
          
          // Check if data is complete
          if (!isDataComplete()) {
            setShowIncompleteDialog(true);
          } else {
            setShowAcceptDialog(true);
          }
        }
      }
    };
    
    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, [hasData, hasAcceptedData, shouldBlockNavigation, isDataComplete]);
  
  // Handle CTA button click
  const handleNavigateToContact = () => {
    if (!hasData) {
      setPendingNavigation("/contacto");
      setShowIncompleteDialog(true);
      return;
    }
    
    if (!isDataComplete()) {
      setPendingNavigation("/contacto");
      setShowIncompleteDialog(true);
      return;
    }
    
    setPendingNavigation("/contacto");
    setShowAcceptDialog(true);
  };
  
  // Accept and navigate
  const handleAccept = () => {
    acceptData();
    setShouldBlockNavigation(false);
    setShowAcceptDialog(false);
    
    setTimeout(() => {
      if (pendingNavigation) {
        router.push(pendingNavigation);
      }
    }, 100);
  };
  
  // Cancel and navigate without saving
  const handleCancel = () => {
    clearData();
    setShouldBlockNavigation(false);
    setShowAcceptDialog(false);
    
    setTimeout(() => {
      if (pendingNavigation) {
        router.push(pendingNavigation);
      }
    }, 100);
  };
  
  // Close incomplete dialog
  const handleCloseIncomplete = () => {
    setShowIncompleteDialog(false);
    setPendingNavigation(null);
  };

  return (
    <>
      <section className="ambient-section home-reflections py-12 md:py-16">
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg dark:glow-primary">
                  <Icon name="Calculator" className="w-8 h-8 text-white dark:text-black" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                {t("roi.calculator.title")}
              </h1>
              <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
                {t("roi.calculator.description")}
              </p>
            </div>
        </div>
      </section>

      <section className="ambient-section home-reflections py-12 md:py-16">
        <div className="container relative z-10 mx-auto max-w-screen-xl px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                  <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
                    <Icon name="TrendingUp" className="w-5 h-5 text-primary" />
                    {t("roi.calculator.whatIsROI.title")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("roi.calculator.whatIsROI.description")}
                  </p>
                </div>

                <div className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                  <h2 className="text-xl font-bold mb-3 text-foreground flex items-center gap-2">
                    <Icon name="Calculator" className="w-5 h-5 text-primary" />
                    {t("roi.calculator.whatIsCalculator.title")}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t("roi.calculator.whatIsCalculator.description")}
                  </p>
                </div>
              </div>
            </div>
        </div>
      </section>

      <section className="ambient-section home-reflections py-12 md:py-16">
        <div id="roi-calculator" className="container relative z-10 mx-auto max-w-screen-xl px-4 scroll-mt-24">
          <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto items-stretch">
            {/* Inputs */}
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-8 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20 h-full flex flex-col">
              <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                <Icon name="Info" className="w-6 h-6 text-primary" />
                {t("roi.calculator.inputs.title")}
              </h2>
              <div className="space-y-6 flex-1">
                {/* Clinic Type */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">
                    {t("roi.calculator.inputs.clinicType.label")}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {CLINIC_TYPES.map((clinic) => {
                      const isSelected = inputs.clinicType === clinic.id;
                      return (
                        <button
                          key={clinic.id}
                          onClick={() => setClinicType(clinic.id)}
                          className={`relative rounded-lg border p-4 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary bg-primary/10 dark:bg-primary/20"
                              : "border-border bg-card hover:border-primary/50"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2 text-center">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${clinic.color} flex items-center justify-center ${isSelected ? "dark:glow-sm" : ""}`}>
                              <Icon name={clinic.icon as any} className="w-6 h-6 text-white" />
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                              {t(`roi.calculator.inputs.presets.${clinic.id}`)}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("roi.calculator.inputs.clinicType.help")}
                  </p>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthly-patients" className="text-sm font-medium">
                      {t("roi.calculator.inputs.monthlyPatients.label")}
                    </Label>
                    <Input
                      id="monthly-patients"
                      type="number"
                      value={inputs.monthlyPatients}
                      onChange={(e) => setMonthlyPatients(Number(e.target.value))}
                      className="text-lg"
                      min="0"
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("roi.calculator.inputs.monthlyPatients.help")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avg-ticket" className="text-sm font-medium">
                      {t("roi.calculator.inputs.avgTicket.label")}
                    </Label>
                    <div className="relative">
                      <Icon name="Euro" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="avg-ticket"
                        type="number"
                        value={inputs.avgTicket}
                        onChange={(e) => setAvgTicket(Number(e.target.value))}
                        className="text-lg pl-10"
                        min="0"
                        placeholder="0"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("roi.calculator.inputs.avgTicket.help")}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="missed-rate" className="text-sm font-medium">
                      {t("roi.calculator.inputs.missedRate.label")}
                    </Label>
                    <div className="relative">
                      <Input
                        id="missed-rate"
                        type="number"
                        value={inputs.missedRate}
                        onChange={(e) => setMissedRate(Number(e.target.value))}
                        className="text-lg"
                        min="0"
                        max="100"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        %
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("roi.calculator.inputs.missedRate.help")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="destructive"
                  onClick={clearData}
                  className="cursor-pointer"
                >
                  {t("roi.calculator.inputs.presets.clear")}
                </Button>
              </div>
            </div>
            
            {/* Results */}
            <div className="space-y-6 h-full flex flex-col">
              <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <Icon name="TrendingUp" className="w-7 h-7 text-primary" />
                {t("roi.calculator.results.title")}
              </h2>

              <div className="space-y-6 flex-1">
                <div className="rounded-xl border border-primary bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/20 dark:to-accent/20 p-6 backdrop-blur-sm transition-all hover:shadow-2xl dark:hover:shadow-primary/20">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("roi.calculator.results.monthlyRevenue")}
                    </p>
                    <Icon name="Euro" className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-4xl font-bold text-primary mb-1">
                    {!hasData ? '-' : (mounted ? `${results?.monthlyRevenue.toLocaleString()}€` : `${results?.monthlyRevenue}€`)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("roi.calculator.results.yearlyRevenue")}: {!hasData ? '-' : (mounted ? `${results?.yearlyRevenue.toLocaleString()}€` : `${results?.yearlyRevenue}€`)}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("roi.calculator.results.roi")}
                    </p>
                    <Icon name="TrendingUp" className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-4xl font-bold text-foreground mb-1">
                    {!hasData ? '-' : `${(results?.roi ?? 0) > 0 ? '+' : ''}${results?.roi}%`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("roi.calculator.results.roiHelp")}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      {t("roi.calculator.results.breakEven")}
                    </p>
                    <Icon name="Clock" className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-4xl font-bold text-foreground mb-1">
                    {!hasData ? '-' : `${results?.breakEvenDays} ${t("roi.calculator.results.days")}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("roi.calculator.results.breakEvenHelp")}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 transition-all hover:border-primary hover:shadow-2xl dark:hover:shadow-primary/20">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    {t("roi.calculator.results.breakdown")}
                  </h3>
                  <div className="space-y-3 text-base">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("roi.calculator.results.missedPatients")}</span>
                      <span className="font-medium text-foreground">{!hasData ? '-' : results?.missedPatients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t("roi.calculator.results.recoveredPatients")}</span>
                      <span className="font-medium text-primary">{!hasData ? '-' : results?.recoveredPatients}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-border">
                      <span className="text-muted-foreground">{t("roi.calculator.results.recoveryRate")}</span>
                      <span className="font-medium text-foreground">{!hasData ? '-' : `${Math.round((results?.recoveryRate ?? 0) * 100)}%`}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:block max-w-4xl mx-auto mt-6">
            <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm p-4">
              <p className="text-sm text-foreground/70 text-center">
                <Icon name="Info" className="w-4 h-4 inline mr-2 text-gradient-to dark:text-primary" />
                {t("roi.calculator.disclaimer")}
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto mt-12 text-center">
            <div className="rounded-2xl border border-primary bg-gradient-to-br from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10 p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                {t("roi.calculator.cta.title")}
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                {t("roi.calculator.cta.description")}
              </p>
              <Button onClick={handleNavigateToContact} className="cursor-pointer">
                {t("roi.calculator.cta.button")}
                <Icon name="Send" className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Accept ROI Dialog */}
      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("roi.dialog.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("roi.dialog.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>
              {t("roi.dialog.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept}>
              {t("roi.dialog.accept")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Incomplete Data Dialog */}
      <AlertDialog open={showIncompleteDialog} onOpenChange={setShowIncompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("roi.dialog.incomplete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("roi.dialog.incomplete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleCloseIncomplete}>
              {t("roi.dialog.incomplete.button")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SiteFooter />
    </>
  );
}
