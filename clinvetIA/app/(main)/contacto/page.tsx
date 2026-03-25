"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/components/providers/i18n-provider";
import { useROIData } from "@/features/roi";
import { useLastBooking, useCalendlyData } from "@/features/booking";
import { confirmBooking } from "@/services/api/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import {
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  CalendarDays,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  validateEmail,
  validatePhone,
  validateFullName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeName,
} from "@/lib/validators";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { STORAGE_KEYS } from "@/constants/app";
import type { LastBooking } from "@/features/booking/booking.types";

function ContactoContent() {
  const { t, lang: locale } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFromBooking = searchParams.get("from") === "booking";

  // ROI data
  const { roiData, hasROIData } = useROIData();

  // Booking data from sessionStorage
  const { lastBooking, clearLastBooking } = useLastBooking();
  const { saveCalendlyData } = useCalendlyData();

  // Booking state
  const [bookingData, setBookingData] = useState<LastBooking | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    clinicName: "",
    message: "",
  });

  // Validation state
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  // Load booking data on mount
  useEffect(() => {
    if (lastBooking && isFromBooking) {
      // Check if hold has expired
      if (lastBooking.hold) {
        const expiresAt = new Date(lastBooking.hold.expiresAt);
        if (expiresAt > new Date()) {
          setBookingData(lastBooking);
        } else {
          setHoldExpired(true);
        }
      } else {
        // No hold data, probably came from completed booking
        setBookingData(lastBooking);
      }
    }
  }, [lastBooking, isFromBooking]);

  // Check if user already submitted
  useEffect(() => {
    try {
      const submitted = localStorage.getItem(STORAGE_KEYS.CONTACT_SUBMITTED);
      if (submitted === "true") {
        setShowSuccess(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Form handlers
  const handleChange = useCallback(
    (field: string, value: string) => {
      let sanitizedValue = value;

      // Apply sanitization
      switch (field) {
        case "fullName":
          sanitizedValue = sanitizeName(value);
          break;
        case "email":
          sanitizedValue = sanitizeEmail(value);
          break;
        case "phone":
          sanitizedValue = sanitizePhone(value);
          break;
      }

      setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
      // Clear error when user types
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate on blur
      let result;
      switch (field) {
        case "fullName":
          result = validateFullName(formData.fullName, locale);
          break;
        case "email":
          result = validateEmail(formData.email, locale);
          break;
        case "phone":
          result = validatePhone(formData.phone, locale);
          break;
        default:
          return;
      }

      if (!result.valid) {
        setErrors((prev) => ({ ...prev, [field]: result.error || null }));
      }
    },
    [formData, locale]
  );

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string | null> = {};

    const nameResult = validateFullName(formData.fullName, locale);
    if (!nameResult.valid) newErrors.fullName = nameResult.error || null;

    const emailResult = validateEmail(formData.email, locale);
    if (!emailResult.valid) newErrors.email = emailResult.error || null;

    const phoneResult = validatePhone(formData.phone, locale);
    if (!phoneResult.valid) newErrors.phone = phoneResult.error || null;

    setErrors(newErrors);
    setTouched({ fullName: true, email: true, phone: true });

    return Object.values(newErrors).every((e) => !e);
  }, [formData, locale]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      if (!bookingData?.hold) {
        setShowError(t("contact.error.no_hold"));
        return;
      }

      if (!hasROIData || !roiData) {
        setShowError(t("contact.error.no_roi"));
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await confirmBooking({
          sessionToken: bookingData.hold.sessionToken,
          locale,
          contact: {
            fullName: formData.fullName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            ...(formData.clinicName.trim()
              ? { clinicName: formData.clinicName.trim() }
              : {}),
            ...(formData.message.trim()
              ? { message: formData.message.trim() }
              : {}),
          },
          roi: roiData,
        });

        if (!result.ok) {
          setShowError(result.message);
          setIsSubmitting(false);
          return;
        }

        // Save to Calendly data
        saveCalendlyData({
          eventUri: `booking-${Date.now()}`,
          inviteeUri: `invitee-${Date.now()}`,
          eventType: "Demo",
          inviteeName: formData.fullName,
          inviteeEmail: formData.email,
          timestamp: Date.now(),
          scheduledDate: result.booking.startAtISO,
          scheduledTime: bookingData.time,
          message: formData.message || undefined,
        });

        // Mark as submitted
        try {
          localStorage.setItem(STORAGE_KEYS.CONTACT_SUBMITTED, "true");
        } catch {
          // ignore
        }

        // Clear booking data
        clearLastBooking();

        setShowSuccess(true);
        setIsSubmitting(false);
      } catch (error) {
        setShowError(t("contact.error.generic"));
        setIsSubmitting(false);
      }
    },
    [
      validateForm,
      bookingData,
      formData,
      hasROIData,
      roiData,
      locale,
      t,
      saveCalendlyData,
      clearLastBooking,
    ]
  );

  // Format date for display
  const formatBookingDate = () => {
    if (!bookingData) return "";
    const date = new Date(bookingData.dateISO);
    return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Success view
  if (showSuccess) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <section className="container mx-auto max-w-2xl px-4">
          <div className="rounded-xl border border-green-500/50 bg-green-500/10 dark:bg-green-500/20 p-12 text-center">
            <Icon
              name="CircleCheck"
              className="w-20 h-20 mx-auto mb-6 text-green-600 dark:text-green-400"
            />
            <h1 className="text-3xl font-bold mb-4 text-green-700 dark:text-green-300">
              {t("contact.success.title")}
            </h1>
            <p className="text-lg text-green-600 dark:text-green-400 mb-8">
              {t("contact.success.description")}
            </p>
            <Button onClick={() => router.push("/")} size="lg">
              {t("contact.success.back_home")}
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="ambient-section pb-16 text-foreground md:pb-24">
        <div className="page-hero-content container mx-auto max-w-screen-xl px-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 via-fuchsia-600 to-pink-600 dark:from-primary dark:via-gradient-purple dark:to-gradient-to flex items-center justify-center shadow-lg">
                <Icon
                  name="Send"
                  className="w-8 h-8 text-white dark:text-black"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              {isFromBooking ? t("contact.booking_title") : t("contact.title")}
            </h1>
            <p className="text-xl text-muted-foreground sm:text-2xl max-w-3xl mx-auto">
              {isFromBooking
                ? t("contact.booking_description")
                : t("contact.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="ambient-section py-16 md:py-24">
        <div className="container mx-auto max-w-screen-xl px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Booking Summary + ROI */}
            <div className="space-y-6">
              {/* Booking Summary */}
              {isFromBooking && bookingData && (
                <div className="rounded-xl border border-primary/20 bg-card/80 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">
                      {t("contact.booking_summary.title")}
                    </h2>
                  </div>

                  {holdExpired ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Icon
                          name="CircleAlert"
                          className="w-5 h-5 text-red-500 mt-0.5"
                        />
                        <div>
                          <p className="font-medium text-red-700 dark:text-red-300">
                            {t("contact.booking_summary.expired")}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => router.push("/reservar")}
                          >
                            {t("contact.booking_summary.select_again")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("contact.booking_summary.date")}
                          </p>
                          <p className="font-medium capitalize">
                            {formatBookingDate()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {t("contact.booking_summary.time")}
                          </p>
                          <p className="font-medium">{bookingData.time}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t("contact.booking_summary.hold_notice")}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ROI Summary */}
              {hasROIData && roiData && (
                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold">
                      {t("contact.roi_summary.title")}
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {t("contact.roi_summary.monthly")}
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        {(
                          roiData as { monthlyRevenue: number }
                        ).monthlyRevenue.toLocaleString()}
                        €
                      </p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {t("contact.roi_summary.yearly")}
                      </p>
                      <p className="text-xl font-bold">
                        {(
                          roiData as { yearlyRevenue: number }
                        ).yearlyRevenue.toLocaleString()}
                        €
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Contact Form */}
            <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-6 lg:p-8">
              <h2 className="text-2xl font-bold mb-6">
                {isFromBooking
                  ? t("contact.form.booking_title")
                  : t("contact.form.title")}
              </h2>

              {!hasROIData && isFromBooking && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon
                      name="TriangleAlert"
                      className="w-5 h-5 text-yellow-600 mt-0.5"
                    />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-300">
                        {t("contact.form.roi_required")}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => router.push("/roi")}
                      >
                        {t("contact.form.go_to_roi")}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {t("contact.form.name")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                      onBlur={() => handleBlur("fullName")}
                      placeholder={t("contact.form.name_placeholder")}
                      className="pl-10"
                      disabled={isSubmitting || holdExpired}
                      aria-invalid={!!errors.fullName && touched.fullName}
                    />
                  </div>
                  {touched.fullName && errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t("contact.form.email")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder={t("contact.form.email_placeholder")}
                      className="pl-10"
                      disabled={isSubmitting || holdExpired}
                      aria-invalid={!!errors.email && touched.email}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t("contact.form.phone")}{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder={t("contact.form.phone_placeholder")}
                      className="pl-10"
                      disabled={isSubmitting || holdExpired}
                      aria-invalid={!!errors.phone && touched.phone}
                    />
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>

                {/* Clinic Name */}
                <div className="space-y-2">
                  <Label htmlFor="clinicName">{t("contact.form.clinic")}</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="clinicName"
                      value={formData.clinicName}
                      onChange={(e) =>
                        handleChange("clinicName", e.target.value)
                      }
                      placeholder={t("contact.form.clinic_placeholder")}
                      className="pl-10"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">{t("contact.form.message")}</Label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder={t("contact.form.message_placeholder")}
                      className="pl-10 min-h-[120px]"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={
                      isSubmitting ||
                      holdExpired ||
                      (isFromBooking && !hasROIData) ||
                      !formData.fullName.trim() ||
                      !formData.email.trim() ||
                      !formData.phone.trim()
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Icon
                          name="Loader"
                          className="w-5 h-5 mr-2 animate-spin"
                        />
                        {t("contact.form.submitting")}
                      </>
                    ) : (
                      <>
                        <Icon name="Send" className="w-5 h-5 mr-2" />
                        {t("contact.form.submit")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Error Modal */}
      <AlertDialog open={!!showError} onOpenChange={() => setShowError(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("contact.error.title")}</AlertDialogTitle>
            <AlertDialogDescription>{showError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction>{t("common.ok")}</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function ContactoPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ContactoContent />
    </Suspense>
  );
}
