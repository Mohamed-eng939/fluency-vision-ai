
import { z } from 'zod';

export const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Full name is required" }),
  username: z.string().min(3, { message: "Username is required (min 3 characters)" }),
  email: z.string().email({ message: "Valid email is required" }),
  phone: z.string().min(4, { message: "Phone number is required (min 4 digits)" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  citizenshipCountry: z.string().min(1, { message: "Country of citizenship is required" }),
  residenceCountry: z.string().min(1, { message: "Country of residence is required" }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  firstLanguage: z.string().min(1, { message: "First language is required" }),
  testReason: z.string().min(1, { message: "Please select a reason" }),
  otherReason: z.string().optional(),
  estimatedLevel: z.string().min(1, { message: "Please select an estimated level" }),
  preferredContact: z.enum(["email", "whatsapp", "phone"]).optional(),
  pronunciationPreference: z.enum(["british", "american", "neutral"]).optional(),
  promoCode: z.string().optional(),
  dataConsent: z.boolean().refine(val => val === true, {
    message: "You must agree to data usage terms",
  }),
  emailResults: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
